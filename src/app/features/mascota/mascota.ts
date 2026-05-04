import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PacienteDTO, PacienteResponseDTO } from '../../models/mascota.model';
import { MascotaService } from '../../services/mascota.service';
import { ClienteService } from '../../services/cliente.service';
import { ConsultaService } from '../../services/consulta.service'; // Importar
import { ClienteResponseDTO } from '../../models/cliente.model';
import { ConsultaResponse } from '../../models/consulta.model'; // Importar
import { ReporteService } from '../../services/reporte.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registrar-mascota',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mascota.html', // Asegúrate de que coincida con el nombre del archivo
  styleUrls: ['./mascota.scss']   // Asegúrate de que coincida con el nombre del archivo
})
export class MascotaComponent implements OnInit {
  dniCliente: string = '';
  clienteEncontrado: ClienteResponseDTO | null = null;

  mascota: PacienteDTO = {
    nombre: '',
    especie: '',
    raza: '',
    edad: 0,
    peso: undefined,
    clienteDni: ''
  };

  // Autocomplete Clientes
  clientesTotales: ClienteResponseDTO[] = [];
  clientesFiltrados: ClienteResponseDTO[] = [];
  busquedaClienteTexto: string = '';
  mostrarSugerencias: boolean = false;

  mascotas: PacienteResponseDTO[] = [];
  listaMascotasCompleta: PacienteResponseDTO[] = []; // Para filtrado local
  
  // Filtros
  filtroEspecie: string = '';
  dniFiltro: string = '';

  // Variables para paginación
  paginaActual = 1;
  itemsPorPagina = 5;

  // Controla si estamos editando y qué mascota editamos
  editando: PacienteResponseDTO | null = null;

  constructor(
    private mascotaService: MascotaService,
    private clienteService: ClienteService,
    private consultaService: ConsultaService,
    private reporteService: ReporteService
  ) {}

  ngOnInit(): void {
    this.cargarMascotas();
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.clienteService.listar().subscribe({
      next: (data) => {
        this.clientesTotales = data;
      },
      error: () => console.error('Error al cargar clientes para autocompletado')
    });
  }

  filtrarClientesSugerencias(): void {
    const texto = this.busquedaClienteTexto.toLowerCase().trim();
    if (!texto) {
      this.clientesFiltrados = [];
      this.mostrarSugerencias = false;
      return;
    }
    this.clientesFiltrados = this.clientesTotales.filter(c => 
      c.nombres.toLowerCase().includes(texto) ||
      c.apellidos.toLowerCase().includes(texto) ||
      c.dni.includes(texto)
    ).slice(0, 5); // Limitar a 5 sugerencias
    this.mostrarSugerencias = this.clientesFiltrados.length > 0;
  }

  seleccionarClienteSugerencia(cliente: ClienteResponseDTO): void {
    this.clienteEncontrado = cliente;
    this.mascota.clienteDni = cliente.dni;
    this.busquedaClienteTexto = `${cliente.nombres} ${cliente.apellidos}`;
    this.mostrarSugerencias = false;
    
    // Feedback visual
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
    Toast.fire({
      icon: 'success',
      title: `Cliente Seleccionado: ${cliente.nombres} ${cliente.apellidos}`
    });
  }

  buscarClientePorDni(): void {
    if (!this.dniCliente || this.dniCliente.length !== 8) {
         Swal.fire('Atención', 'Ingrese un DNI válido de 8 dígitos', 'warning');
         return;
    }

    this.clienteService.buscarPorDni(this.dniCliente).subscribe({
      next: (data) => {
        this.clienteEncontrado = data;
        this.mascota.clienteDni = data.dni;
        
        // Usamos un Toast pequeño en lugar de un popup grande para mejor UX
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        Toast.fire({
          icon: 'success',
          title: `Cliente: ${data.nombres} ${data.apellidos}`
        });
      },
      error: () => {
        this.clienteEncontrado = null;
        this.mascota.clienteDni = '';
        Swal.fire('Error', 'Cliente no encontrado', 'error');
      }
    });
  }

  registrar(): void {
    if (!this.clienteEncontrado) {
      Swal.fire('Advertencia', 'Debe buscar primero un cliente válido por DNI.', 'warning');
      return;
    }

    this.mascotaService.registrar(this.mascota).subscribe({
      next: (nuevaMascota) => {
        Swal.fire('Registrado', 'Mascota registrada correctamente ✅', 'success');
        this.mascotas.unshift(nuevaMascota); // Insertar al inicio
        
        // Auto-descargar credencial
        if (nuevaMascota.codigoPaciente) {
          this.descargarCredencial(nuevaMascota.codigoPaciente);
        }

        this.resetFormulario();
        this.paginaActual = 1;
      },
      error: err => {
        console.error(err);
        let msg = 'Error desconocido';
        
        if (err.error) {
          if (typeof err.error === 'string') {
            msg = err.error;
          } else if (err.error.errors && Array.isArray(err.error.errors)) {
            // Error de validacion de Spring Boot
            msg = err.error.errors.map((e: any) => e.defaultMessage || e.field).join(', ');
          } else if (err.error.message) {
            msg = err.error.message;
          } else {
            msg = JSON.stringify(err.error);
          }
        } else if (err.message) {
          msg = err.message;
        }
        
        Swal.fire('Error', `Error al registrar mascota: ${msg}`, 'error');
      }
    });
  }

  cargarMascotas(): void {
    this.mascotaService.listarTodas().subscribe({
      next: (data) => {
        this.mascotas = data;
        this.listaMascotasCompleta = data; // Guardamos copia original
        this.paginaActual = 1;
      },
      error: (err) => console.error('Error al cargar mascotas', err)
    });
  }

  exportarExcel(): void {
    this.reporteService.exportarPacientes();
  }

  descargarCredencial(codigoPaciente: string): void {
    this.mascotaService.descargarCredencialPdf(codigoPaciente).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `credencial_${codigoPaciente}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar credencial', err);
        Swal.fire('Error', 'No se pudo generar la credencial PDF', 'error');
      }
    });
  }

  // --- LÓGICA DE FILTROS ---

  get especiesUnicas(): string[] {
    // Extraer especies únicas de la lista completa (filtrando nulos/undefined)
    const especies = this.listaMascotasCompleta
      .map(m => m.especie)
      .filter((e): e is string => !!e); // Type Guard para asegurar string
    return [...new Set(especies)].sort();
  }

  filtrar(): void {
    let resultado = [...this.listaMascotasCompleta];

    // 1. Filtro por Especie (Local)
    if (this.filtroEspecie) {
      resultado = resultado.filter(m => m.especie === this.filtroEspecie);
    }

    this.mascotas = resultado;
    this.paginaActual = 1;
    this.paginaActual = 1;
  }

  // --- HISTORIAL ---
  historialVisible: boolean = false;
  mascotaHistorial: PacienteResponseDTO | null = null;
  historialConsultas: ConsultaResponse[] = [];

  verHistorial(m: PacienteResponseDTO): void {
    this.mascotaHistorial = m;
    this.historialVisible = true;
    this.consultaService.obtenerHistorialPorPaciente(m.codigoPaciente).subscribe({
      next: (data: ConsultaResponse[]) => {
        this.historialConsultas = data;
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar el historial', 'error');
        this.historialVisible = false;
      }
    });
  }

  cerrarHistorial(): void {
    this.historialVisible = false;
    this.mascotaHistorial = null;
    this.historialConsultas = [];
  }

  buscarMascotasCliente(): void {
    if (!this.dniFiltro || this.dniFiltro.trim().length !== 8) {
       Swal.fire('Atención', 'Ingrese un DNI de 8 dígitos para buscar', 'warning');
       return;
    }

    this.mascotaService.buscarPorDni(this.dniFiltro).subscribe({
      next: (data) => {
        this.mascotas = data;
        this.listaMascotasCompleta = data; // Ahora el "universo" es solo este cliente
        this.filtroEspecie = ''; // Reseteamos filtro de especie
        this.paginaActual = 1;
        Swal.fire('Resultados', `Se encontraron ${data.length} mascotas`, 'success');
      },
      error: () => Swal.fire('Error', 'No se encontraron resultados o hubo un error', 'error')
    });
  }

  limpiarFiltros(): void {
    this.dniFiltro = '';
    this.filtroEspecie = '';
    this.cargarMascotas(); // Recarga todo desde el backend
  }

  cancelarEdicion(): void {
    this.editando = null;
    this.resetFormulario();
    this.clienteEncontrado = null;
  }

  actualizar(): void {
    if (!this.editando) return;

    const dto: PacienteDTO = {
      nombre: this.mascota.nombre,
      especie: this.mascota.especie,
      raza: this.mascota.raza,
      edad: this.mascota.edad,
      peso: this.mascota.peso,
      clienteDni: this.mascota.clienteDni
    };

    this.mascotaService.actualizar(this.editando.codigoPaciente, dto).subscribe({
      next: (mascotaActualizada) => {
        Swal.fire('Actualizado', 'Mascota actualizada correctamente', 'success');

        // Actualizar la lista en memoria
        this.mascotas = this.mascotas.filter(m => m.codigoPaciente !== mascotaActualizada.codigoPaciente);
        this.mascotas.unshift(mascotaActualizada); // insertarlo como primero

        this.editando = null;
        this.resetFormulario();
        this.paginaActual = 1;
      },
      error: err => {
        console.error(err);
        Swal.fire('Error', 'No se pudo actualizar la mascota', 'error');
      }
    });
  }

  eliminarMascota(codigoPaciente: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la mascota permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then(result => {
      if (result.isConfirmed) {
        this.mascotaService.eliminar(codigoPaciente).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Mascota eliminada correctamente', 'success');
            this.cargarMascotas();
          },
          error: err => {
            console.error(err);
            Swal.fire('Error', 'No se pudo eliminar la mascota', 'error');
          }
        });
      }
    });
  }

  editarMascota(m: PacienteResponseDTO): void {
    // Primero buscamos el cliente para llenar la info visualmente
    this.clienteService.buscarPorDni(m.clienteDni).subscribe({
      next: (cliente: ClienteResponseDTO) => {
        this.clienteEncontrado = cliente;
        
        // Llenamos el formulario
        this.mascota = {
          nombre: m.nombre,
          especie: m.especie,
          raza: m.raza,
          edad: m.edad,
          peso: m.peso,
          clienteDni: m.clienteDni
        };
        
        this.busquedaClienteTexto = `${cliente.nombres} ${cliente.apellidos}`;
        
        this.editando = m;
        
        // Scroll suave hacia arriba para ver el formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => {
        Swal.fire('Error', 'No se pudo obtener el cliente asociado', 'error');
      }
    });
  }

  resetFormulario(): void {
    this.mascota = {
      nombre: '',
      especie: '',
      raza: '',
      edad: 0,
      peso: undefined,
      clienteDni: ''
    };
    this.dniCliente = '';
    this.busquedaClienteTexto = '';
    this.mostrarSugerencias = false;
    // Nota: No reseteamos clienteEncontrado aquí si queremos seguir registrando mascotas para el mismo cliente,
    // pero según tu lógica original sí lo hacías, así que lo mantengo:
    // this.clienteEncontrado = null; 
    // (Opcional: puedes comentar la línea de abajo si quieres registrar varias mascotas al mismo dueño seguidas)
    this.clienteEncontrado = null; 
  }

  // --- PAGINACIÓN ---
  get mascotasPaginadas(): PacienteResponseDTO[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.mascotas.slice(inicio, inicio + this.itemsPorPagina);
  }

  totalPaginas(): number {
    return Math.ceil(this.mascotas.length / this.itemsPorPagina);
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas()) {
      this.paginaActual++;
    }
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }
}