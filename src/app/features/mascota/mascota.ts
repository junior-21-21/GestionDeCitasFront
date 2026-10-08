import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PacienteDTO, PacienteResponseDTO } from '../../models/mascota.model';
import { MascotaService } from '../../services/mascota.service';
import { ClienteService } from '../../services/cliente.service';
import { ConsultaService } from '../../services/consulta.service';
import { ClienteResponseDTO } from '../../models/cliente.model';
import { ConsultaResponse } from '../../models/consulta.model';
import { ReporteService } from '../../services/reporte.service';
import { EspecieRazaService } from '../../services/especie-raza.service';
import { Especie, Raza } from '../../models/especie-raza.model';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-registrar-mascota',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mascota.html',
  styleUrls: ['./mascota.scss']
})
export class MascotaComponent implements OnInit {
  dniCliente: string = '';
  clienteEncontrado: ClienteResponseDTO | null = null;

  mascota: PacienteDTO = {
    nombre: '',
    razaId: 0,
    fechaNacimiento: '',
    peso: undefined,
    genero: '',
    clienteDni: ''
  };

  // Autocomplete Clientes
  clientesTotales: ClienteResponseDTO[] = [];
  clientesFiltrados: ClienteResponseDTO[] = [];
  busquedaClienteTexto: string = '';
  mostrarSugerencias: boolean = false;

  mascotas: PacienteResponseDTO[] = [];
  listaMascotasCompleta: PacienteResponseDTO[] = [];
  
  // Filtros
  filtroEspecie: string = '';
  dniFiltro: string = '';

  // Especies y Razas normalizadas
  especies: Especie[] = [];
  razasFiltradas: Raza[] = [];
  especieSeleccionada: number | null = null;

  // Variables para paginación
  paginaActual = 1;
  itemsPorPagina = 5;

  // Controla si estamos editando y qué mascota editamos
  editando: PacienteResponseDTO | null = null;

  // ── Credencial premium ───────────────────────────────────────────────────
  modalCredencialVisible = false;
  mascotaCredencial: PacienteResponseDTO | null = null;
  fotoCredencialDataUrl: string | null = null;
  fotoCredencialNombre: string = '';
  // ─────────────────────────────────────────────────────────────────────────

  // Fecha actual para restringir el calendario
  fechaActual: string = new Date().toISOString().split('T')[0];

  constructor(
    private mascotaService: MascotaService,
    private clienteService: ClienteService,
    private consultaService: ConsultaService,
    private reporteService: ReporteService,
    private especieRazaService: EspecieRazaService
  ) {}

  ngOnInit(): void {
    this.cargarMascotas();
    this.cargarClientes();
    this.cargarEspecies();
  }

  cargarClientes(): void {
    this.clienteService.listar().subscribe({
      next: (data) => {
        this.clientesTotales = data;
      },
      error: () => console.error('Error al cargar clientes para autocompletado')
    });
  }

  cargarEspecies(): void {
    this.especieRazaService.listarEspecies().subscribe({
      next: (data) => this.especies = data,
      error: () => console.error('Error al cargar especies')
    });
  }

  onEspecieChange(especieId: number | null): void {
    this.especieSeleccionada = especieId;
    this.razasFiltradas = [];
    this.mascota.razaId = 0;
    if (especieId) {
      this.especieRazaService.listarRazasPorEspecie(especieId).subscribe({
        next: (data) => this.razasFiltradas = data,
        error: () => console.error('Error al cargar razas')
      });
    }
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
    ).slice(0, 5);
    this.mostrarSugerencias = this.clientesFiltrados.length > 0;
  }

  seleccionarClienteSugerencia(cliente: ClienteResponseDTO): void {
    this.clienteEncontrado = cliente;
    this.mascota.clienteDni = cliente.dni;
    this.busquedaClienteTexto = `${cliente.nombres} ${cliente.apellidos}`;
    this.mostrarSugerencias = false;
    
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
        Swal.fire({
          title: 'Registrado',
          text: 'Mascota registrada correctamente ✅',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        this.mascotas.unshift(nuevaMascota);
        
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
        this.listaMascotasCompleta = data;
        this.paginaActual = 1;
      },
      error: (err) => console.error('Error al cargar mascotas', err)
    });
  }

  exportarExcel(): void {
    this.reporteService.exportarPacientes();
  }

  descargarCredencial(codigoPaciente: string): void {
    // Busca la mascota en la lista local para abrir el modal premium
    const mascota = this.mascotas.find(m => m.codigoPaciente === codigoPaciente);
    if (mascota) {
      this.abrirModalCredencial(mascota);
    } else {
      // Fallback al PDF del backend
      this.mascotaService.descargarCredencialPdf(codigoPaciente).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        },
        error: () => Swal.fire('Error', 'No se pudo generar la credencial PDF', 'error')
      });
    }
  }

  abrirModalCredencial(mascota: PacienteResponseDTO): void {
    this.mascotaCredencial = mascota;
    this.fotoCredencialDataUrl = null;
    this.fotoCredencialNombre = '';

    if (mascota.fotoUrl) {
      // Si la foto está en la DB, construir URL completa
      const baseUrl = environment.apiUrl.replace('/api', '');
      this.fotoCredencialDataUrl = baseUrl + mascota.fotoUrl;
    }

    this.modalCredencialVisible = true;
  }

  cerrarModalCredencial(): void {
    this.modalCredencialVisible = false;
    this.mascotaCredencial = null;
    this.fotoCredencialDataUrl = null;
  }

  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.fotoCredencialNombre = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.fotoCredencialDataUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Subir la foto al backend automáticamente
    if (this.mascotaCredencial) {
      this.mascotaService.subirFoto(this.mascotaCredencial.codigoPaciente, file).subscribe({
        next: (res) => {
          this.mascotaCredencial!.fotoUrl = res.url;
          // Actualizar en la lista local para no perder la ref
          const mLista = this.mascotas.find(m => m.codigoPaciente === this.mascotaCredencial!.codigoPaciente);
          if (mLista) mLista.fotoUrl = res.url;
          
          const Toast = Swal.mixin({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
          });
          Toast.fire({ icon: 'success', title: 'Foto guardada en la base de datos' });
        },
        error: () => {
          Swal.fire('Error', 'No se pudo guardar la foto en el servidor', 'error');
        }
      });
    }
  }

  generarCredencialPremium(): void {
    const m = this.mascotaCredencial;
    if (!m) return;

    const elementoPreview = document.getElementById('credencial-preview');
    if (!elementoPreview) {
      Swal.fire('Error', 'No se encontró la vista previa de la credencial', 'error');
      return;
    }

    // Usamos html2canvas para capturar exactamente como se ve en pantalla
    html2canvas(elementoPreview, { 
      scale: 3, // Alta calidad
      useCORS: true,
      backgroundColor: null
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      
      // Tamaño estándar CR80: 85.6 x 54 mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 54]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 54);
      
      const blob = pdf.output('blob');
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      this.cerrarModalCredencial();
    }).catch(err => {
      console.error('Error al generar PDF con html2canvas:', err);
      Swal.fire('Error', 'Hubo un problema al renderizar el PDF', 'error');
    });
  }

  // --- MRZ GENERADOR (Machine Readable Zone) ---
  get mrzLinea1(): string {
    const m = this.mascotaCredencial;
    if (!m) return 'I<PER<<<<<<<<<<<<<<<<<<<<<<<<<<';
    const cod = (m.codigoPaciente || '').replace(/-/g, '').padEnd(9, '<');
    const nom = (m.nombre || '').replace(/\s+/g, '<').toUpperCase();
    return `I<PER${cod}<<${nom}`.padEnd(30, '<').substring(0, 30);
  }

  get mrzLinea2(): string {
    const m = this.mascotaCredencial;
    if (!m) return '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<';
    
    // Fecha de Nacimiento (YYMMDD)
    let fNac = '<<<<<<';
    if (m.fechaNacimiento) {
      const d = new Date(m.fechaNacimiento + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        fNac = d.getFullYear().toString().substring(2,4) + 
               (d.getMonth() + 1).toString().padStart(2, '0') + 
               d.getDate().toString().padStart(2, '0');
      }
    }
    
    // Género
    let sexo = '<';
    if (m.genero?.toLowerCase() === 'macho') sexo = 'M';
    else if (m.genero?.toLowerCase() === 'hembra') sexo = 'F';

    // Fecha de Caducidad (Fijada a 31-12-2034 como en la UI) = 341231
    const fCad = '341231';
    
    return `${fNac}0${sexo}${fCad}0PER<<<<<<<<<<<0`.padEnd(30, '<').substring(0, 30);
  }

  // --- LÓGICA DE FILTROS ---

  get especiesUnicas(): string[] {
    return this.especies.map(e => e.nombre).sort();
  }

  filtrar(): void {
    let resultado = [...this.listaMascotasCompleta];

    if (this.filtroEspecie) {
      resultado = resultado.filter(m => m.especie === this.filtroEspecie);
    }

    this.mascotas = resultado;
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
        this.listaMascotasCompleta = data;
        this.filtroEspecie = '';
        this.paginaActual = 1;
        Swal.fire('Resultados', `Se encontraron ${data.length} mascotas`, 'success');
      },
      error: () => Swal.fire('Error', 'No se encontraron resultados o hubo un error', 'error')
    });
  }

  limpiarFiltros(): void {
    this.dniFiltro = '';
    this.filtroEspecie = '';
    this.cargarMascotas();
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
      razaId: this.mascota.razaId,
      fechaNacimiento: this.mascota.fechaNacimiento,
      peso: this.mascota.peso,
      genero: this.mascota.genero,
      clienteDni: this.mascota.clienteDni
    };

    this.mascotaService.actualizar(this.editando.codigoPaciente, dto).subscribe({
      next: (mascotaActualizada) => {
        Swal.fire({
          title: 'Actualizado',
          text: 'Mascota actualizada correctamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        this.mascotas = this.mascotas.filter(m => m.codigoPaciente !== mascotaActualizada.codigoPaciente);
        this.mascotas.unshift(mascotaActualizada);
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
            Swal.fire({
              title: 'Eliminado',
              text: 'Mascota eliminada correctamente',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
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
    this.clienteService.buscarPorDni(m.clienteDni).subscribe({
      next: (cliente: ClienteResponseDTO) => {
        this.clienteEncontrado = cliente;
        
        this.mascota = {
          nombre: m.nombre,
          razaId: m.razaId || 0,
          fechaNacimiento: m.fechaNacimiento || '',
          peso: m.peso,
          genero: m.genero || '',
          clienteDni: m.clienteDni
        };
        
        // Pre-seleccionar especie y cargar razas
        if (m.especieId) {
          this.especieSeleccionada = m.especieId;
          this.especieRazaService.listarRazasPorEspecie(m.especieId).subscribe({
            next: (razas) => this.razasFiltradas = razas
          });
        }
        
        this.busquedaClienteTexto = `${cliente.nombres} ${cliente.apellidos}`;
        this.editando = m;
        
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
      razaId: 0,
      fechaNacimiento: '',
      peso: undefined,
      genero: '',
      clienteDni: ''
    };
    this.dniCliente = '';
    this.busquedaClienteTexto = '';
    this.mostrarSugerencias = false;
    this.especieSeleccionada = null;
    this.razasFiltradas = [];
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