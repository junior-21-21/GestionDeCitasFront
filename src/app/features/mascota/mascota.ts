import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MascotaDTO, MascotaResponseDTO } from '../../models/mascota.model';
import { MascotaService } from '../../services/mascota.service';
import { ClienteService } from '../../services/cliente.service';
import { ConsultaService } from '../../services/consulta.service'; // Importar
import { ClienteResponseDTO } from '../../models/cliente.model';
import { ConsultaResponse } from '../../models/consulta.model'; // Importar
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

  mascota: MascotaDTO = {
    nombre: '',
    especie: '',
    raza: '',
    edad: 0,
    clienteId: 0
  };

  mascotas: MascotaResponseDTO[] = [];
  listaMascotasCompleta: MascotaResponseDTO[] = []; // Para filtrado local
  
  // Filtros
  filtroEspecie: string = '';
  dniFiltro: string = '';

  // Variables para paginación
  paginaActual = 1;
  itemsPorPagina = 5;

  // Controla si estamos editando y qué mascota editamos
  editando: MascotaResponseDTO | null = null;

  constructor(
    private mascotaService: MascotaService,
    private clienteService: ClienteService,
    private consultaService: ConsultaService
  ) {}

  ngOnInit(): void {
    this.cargarMascotas();
  }

  buscarClientePorDni(): void {
    if (!this.dniCliente || this.dniCliente.length !== 8) {
         Swal.fire('Atención', 'Ingrese un DNI válido de 8 dígitos', 'warning');
         return;
    }

    this.clienteService.buscarPorDni(this.dniCliente).subscribe({
      next: (data) => {
        this.clienteEncontrado = data;
        this.mascota.clienteId = data.id;
        
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
        this.mascota.clienteId = 0;
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
        this.resetFormulario();
        this.paginaActual = 1;
      },
      error: err => {
        console.error(err);
        Swal.fire('Error', `Error al registrar mascota: ${err.error}`, 'error');
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
  mascotaHistorial: MascotaResponseDTO | null = null;
  historialConsultas: ConsultaResponse[] = [];

  verHistorial(m: MascotaResponseDTO): void {
    this.mascotaHistorial = m;
    this.historialVisible = true;
    this.consultaService.obtenerHistorialPorMascota(m.id).subscribe({
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

    const dto: MascotaDTO = {
      nombre: this.mascota.nombre,
      especie: this.mascota.especie,
      raza: this.mascota.raza,
      edad: this.mascota.edad,
      clienteId: this.mascota.clienteId
    };

    this.mascotaService.actualizar(this.editando.id, dto).subscribe({
      next: (mascotaActualizada) => {
        Swal.fire('Actualizado', 'Mascota actualizada correctamente', 'success');

        // Actualizar la lista en memoria
        this.mascotas = this.mascotas.filter(m => m.id !== mascotaActualizada.id);
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

  eliminarMascota(id: number): void {
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
        this.mascotaService.eliminar(id).subscribe({
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

  editarMascota(m: MascotaResponseDTO): void {
    // Primero buscamos el cliente para llenar la info visualmente
    this.clienteService.buscarPorId(m.clienteId).subscribe({
      next: (cliente) => {
        this.clienteEncontrado = cliente;
        
        // Llenamos el formulario
        this.mascota = {
          nombre: m.nombre,
          especie: m.especie,
          raza: m.raza,
          edad: m.edad,
          clienteId: m.clienteId
        };
        
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
      clienteId: 0
    };
    this.dniCliente = '';
    // Nota: No reseteamos clienteEncontrado aquí si queremos seguir registrando mascotas para el mismo cliente,
    // pero según tu lógica original sí lo hacías, así que lo mantengo:
    // this.clienteEncontrado = null; 
    // (Opcional: puedes comentar la línea de abajo si quieres registrar varias mascotas al mismo dueño seguidas)
    this.clienteEncontrado = null; 
  }

  // --- PAGINACIÓN ---
  get mascotasPaginadas(): MascotaResponseDTO[] {
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