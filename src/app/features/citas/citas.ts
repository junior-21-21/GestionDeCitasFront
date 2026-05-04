import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../services/cita.service';
import { MascotaService } from '../../services/mascota.service';
import { VeterinarioService } from '../../services/veterinario.service';
import { AuthService } from '../../services/auth.service';
import { EspecialidadService } from '../../services/especialidad.service';
import { ClienteService } from '../../services/cliente.service'; // Added ClienteService
import { CitaDTO } from '../../models/cita-dto.model';
import { ClienteResponseDTO } from '../../models/cliente.model'; // Importante para el tipo
import { CitaResponseDTO } from '../../models/cita-response.model';
import { ConsultaService } from '../../services/consulta.service';
import Swal from 'sweetalert2';
import { FullCalendarModule } from '@fullcalendar/angular';
import {
  CalendarOptions,
  EventClickArg,
  DateSelectArg,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './citas.html',
  styleUrls: ['./citas.scss'],
})
export class CitasComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek',
    },
    locale: esLocale,
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    },
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    },
    height: 'auto',
    weekends: true,
    editable: false,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    events: [],
  };

  pacientes: any[] = [];
  veterinarios: any[] = [];
  vetDniLogueado: string | null = null;

  // Filtros y Especialidades
  especialidades: any[] = [];
  especialidadSeleccionada: string = '';
  veterinariosFiltrados: any[] = [];

  // Buscador
  dniBusqueda: string = '';
  buscandoCliente: boolean = false;
  nombreClienteEncontrado: string = '';
  clienteNoEncontrado: boolean = false;
  buscandoPacientes: boolean = false;
  clientesSugeridos: ClienteResponseDTO[] = []; 
  private dniSubject = new Subject<string>(); // Subject para el debounce

  nuevaCita: CitaDTO = {
    fecha: '',
    hora: '',
    motivo: '',
    pacienteCodigo: '',
    veterinarioDni: '',
    duracionMinutos: 30,
  };

  // UI States
  mostrarModal: boolean = false;
  esReprogramacion: boolean = false;
  citaCodigoReprogramar: string | null = null;

  duraciones = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '1 hora', value: 60 },
  ];

  constructor(
    private citaService: CitaService,
    private mascotaService: MascotaService,
    private veterinarioService: VeterinarioService,
    private authService: AuthService,
    private especialidadService: EspecialidadService,
    private clienteService: ClienteService,
    private consultaService: ConsultaService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.cargarVeterinarios();
    this.cargarEspecialidades();

    // Si es veterinario, resolver DNI primero y luego cargar solo sus citas
    const usuario = this.authService.getUsuario();
    if (usuario && usuario.rol === 'VETERINARIO') {
      this.veterinarioService.obtenerPorEmail(usuario.email).subscribe({
        next: (vet) => {
          this.vetDniLogueado = vet.dni;
          this.cargarCitas();
        },
        error: () => {
          // Fallback: cargar todas las citas si no se encuentra el vet
          this.cargarCitas();
        }
      });
    } else {
      this.cargarCitas();
    }

    // Configurar debounce para el buscador
    this.dniSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(dni => {
      this.ejecutarBusquedaCliente(dni);
    });
  }

  cargarEspecialidades(): void {
    this.especialidadService
      .listar()
      .subscribe((data) => (this.especialidades = data));
  }

  cargarVeterinarios(): void {
    this.veterinarioService.listar().subscribe((data) => {
      this.veterinarios = data;
      this.veterinariosFiltrados = data;
    });
  }

  filtrarVeterinarios(): void {
    if (this.especialidadSeleccionada) {
      this.veterinariosFiltrados = this.veterinarios.filter(
        (v) => v.especialidad === this.especialidadSeleccionada,
      );
    } else {
      this.veterinariosFiltrados = [...this.veterinarios];
    }

    // Si el veterinario seleccionado ya no es válido, resetear
    const vetEnLista = this.veterinariosFiltrados.find(
      (v) => v.dni == this.nuevaCita.veterinarioDni,
    );
    if (!vetEnLista) {
      this.nuevaCita.veterinarioDni = '';
    }
  }

  cargarCitas(): void {
    const obs = this.vetDniLogueado
      ? this.citaService.listarResumenPorVeterinario(this.vetDniLogueado)
      : this.citaService.listarResumen();

    obs.subscribe({
      next: (data: CitaResponseDTO[]) => {
        this.calendarOptions.events = data.map((cita) => {
          const duracion = cita.duracionMinutos || 30;
          const [hora, min] = cita.hora.split(':').map(Number);
          const totalMin = hora * 60 + min + duracion;
          const horaFin = Math.floor(totalMin / 60);
          const minFin = totalMin % 60;
          const horaFinStr = `${horaFin.toString().padStart(2, '0')}:${minFin.toString().padStart(2, '0')}:00`;

          return {
            id: cita.codigoCita,
            title: `${cita.nombrePaciente} - ${cita.nombreVeterinario}`,
            start: `${cita.fecha}T${cita.hora}`,
            end: `${cita.fecha}T${horaFinStr}`,
            color: this.getColorEstado(cita.estado),
            extendedProps: { ...cita },
          };
        });
      },
      error: () => Swal.fire('Error', '❌ Error al cargar citas', 'error'),
    });
  }

  getColorEstado(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return '#3788d8'; // Azul
      case 'REALIZADA':
        return '#28a745'; // Verde
      case 'CANCELADA':
        return '#dc3545'; // Rojo
      case 'REPROGRAMADO':
        return '#ffc107'; // Amarillo
      default:
        return '#6c757d';
    }
  }

  buscarCliente(): void {
    // Al escribir, enviamos al Subject en lugar de buscar directamente
    this.dniSubject.next(this.dniBusqueda);
  }

  // Método que ejecuta la búsqueda real (llamado por el Subject debounced)
  ejecutarBusquedaCliente(dni: string): void {
    if (!dni) {
       this.clientesSugeridos = [];
       return;
    }
    
    this.clienteNoEncontrado = false;
    this.nombreClienteEncontrado = '';
    this.pacientes = []; 

    this.buscandoCliente = true;
    this.clienteService.buscarPorDniParcial(dni).subscribe({
      next: (clientes) => {
        this.buscandoCliente = false;
        this.clientesSugeridos = clientes;
        
        // Si no hay sugerencias y el DNI es largo, asumimos que no existe
        if (clientes.length === 0 && dni.length >= 8) {
           this.clienteNoEncontrado = true;
        }
      },
      error: (err) => {
        console.error(err);
        this.buscandoCliente = false;
        this.clientesSugeridos = [];
      }
    });
  }

  seleccionarCliente(cliente: ClienteResponseDTO): void {
      this.dniBusqueda = cliente.dni;
      this.clientesSugeridos = []; // Ocultar lista
      this.nombreClienteEncontrado = `${cliente.nombres} ${cliente.apellidos}`;
      this.clienteNoEncontrado = false;
      this.buscarPacientesDelCliente(cliente.dni);
  }

  buscarPacientesDelCliente(clienteDni: string): void {
    this.buscandoPacientes = true;
    this.mascotaService.listarPorCliente(clienteDni).subscribe({
      next: (data) => {
        this.pacientes = data;
        this.buscandoPacientes = false;
        this.buscandoCliente = false;
      },
      error: () => {
        this.buscandoPacientes = false;
        this.buscandoCliente = false;
        Swal.fire('Error', 'Error al cargar pacientes del cliente', 'error');
      },
    });
  }

  // Deprecated direct search, replaced by buscarCliente
  buscarMascotas(): void {
    this.buscarCliente();
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    // Validar fecha futura
    // Validar fecha futura (SOLUCIÓN CORREGIDA)
    const fechaSeleccionadaStr = selectInfo.startStr.split('T')[0]; // "YYYY-MM-DD"
    const fechaActualStr = new Date().toLocaleDateString('en-CA'); // "YYYY-MM-DD" en zona local (formato ISO)

    if (fechaSeleccionadaStr < fechaActualStr) {
      Swal.fire(
        'Fecha inválida',
        'No puede agendar citas en el pasado.',
        'warning',
      );
      return;
    }

    this.resetFormulario();
    this.nuevaCita.fecha = selectInfo.startStr.split('T')[0];
    const time = selectInfo.startStr.split('T')[1];
    this.nuevaCita.hora = time ? time.substring(0, 5) : '09:00';
    this.mostrarModal = true;
  }

  handleEventClick(clickInfo: EventClickArg) {
    const cita = clickInfo.event.extendedProps as CitaResponseDTO;
    const esRealizada = cita.estado === 'REALIZADA';

    Swal.fire({
      title: `Cita ${cita.codigoCita}`,
      html: `
        <div class="text-start">
          <p><strong>Paciente:</strong> ${cita.nombrePaciente}</p>
          <p><strong>Veterinario:</strong> ${cita.nombreVeterinario}</p>
          <p><strong>Motivo:</strong> ${cita.motivo}</p>
          <p><strong>Estado:</strong> <span class="badge ${this.getBadgeClass(cita.estado)}">${cita.estado}</span></p>
        </div>
      `,
      showDenyButton: !esRealizada,
      showCancelButton: true,
      showConfirmButton: !esRealizada && cita.estado !== 'CANCELADA',
      confirmButtonText: 'Atender',
      denyButtonText: 'Cancelar',
      cancelButtonText: esRealizada ? 'Cerrar' : 'Cerrar',
      footer: esRealizada
        ? `
          <div class="d-flex gap-2 justify-content-center">
            <button id="btn-ver-diagnostico" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i> Ver Diagnóstico</button>
            <button id="btn-descargar-pdf" class="btn btn-sm btn-outline-danger"><i class="bi bi-file-pdf"></i> Comprobante</button>
          </div>
        `
        : cita.estado === 'CANCELADA'
          ? '<button id="btn-eliminar" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i> Liberar Horario</button>'
          : '<button id="btn-reprogramar" class="btn btn-sm btn-outline-warning"><i class="bi bi-calendar-event"></i> Reprogramar</button>',
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/consultas'], {
          queryParams: { citaCodigo: cita.codigoCita },
        });
      } else if (result.isDenied) {
        if (cita.estado !== 'CANCELADA') {
          this.cambiarEstado(cita.codigoCita, 'CANCELADA');
        }
      }
    });

    // Event Listeners para botones del footer (Hack de SweetAlert2)
    setTimeout(() => {
      const btnVer = document.getElementById('btn-ver-diagnostico');
      if (btnVer) {
        btnVer.addEventListener('click', () => {
          Swal.close();
          this.verDiagnostico(cita);
        });
      }

      const btnPdf = document.getElementById('btn-descargar-pdf');
      if (btnPdf) {
        btnPdf.addEventListener('click', () => {
          Swal.close();
          this.descargarComprobante(cita.codigoCita);
        });
      }

      const btnRepro = document.getElementById('btn-reprogramar');
      if (btnRepro) {
        btnRepro.addEventListener('click', () => {
          Swal.close();
          this.prepararReprogramacion(cita);
        });
      }

      const btnEliminar = document.getElementById('btn-eliminar');
      if (btnEliminar) {
        btnEliminar.addEventListener('click', () => {
          Swal.close();
          this.confirmarEliminacion(cita.codigoCita);
        });
      }
    }, 100);
  }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-primary';
      case 'REALIZADA':
        return 'bg-success';
      case 'CANCELADA':
        return 'bg-danger';
      case 'REPROGRAMADO':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  }

  cambiarEstado(codigoCita: string, estado: string): void {
    this.citaService.cambiarEstado(codigoCita, estado).subscribe({
      next: () => {
        Swal.fire('Actualizado', `Cita marcada como ${estado}`, 'success');
        this.cargarCitas();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  descargarComprobante(codigoCita: string): void {
    this.citaService.descargarComprobante(codigoCita).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comprobante_cita_${codigoCita}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () =>
        Swal.fire('Error', 'No se pudo descargar el comprobante', 'error'),
    });
  }

  prepararReprogramacion(cita: CitaResponseDTO): void {
    this.esReprogramacion = true;
    this.citaCodigoReprogramar = cita.codigoCita;

    this.nuevaCita.fecha = cita.fecha;
    this.nuevaCita.hora = cita.hora;
    this.nuevaCita.motivo = cita.motivo;

    this.nuevaCita.pacienteCodigo = cita.pacienteCodigo || '';
    this.nuevaCita.veterinarioDni = cita.veterinarioDni || '';

    const vet = this.veterinarios.find(
      (v) => v.dni === this.nuevaCita.veterinarioDni,
    );
    if (vet) {
      this.especialidadSeleccionada = vet.especialidad || '';
      this.filtrarVeterinarios();
    } else {
      this.especialidadSeleccionada = '';
      this.filtrarVeterinarios();
    }

    this.mostrarModal = true;
    Swal.fire(
      'Reprogramar',
      'Modifique la fecha u hora según necesite.',
      'info',
    );
  }

  guardarCita(): void {
    if (this.esReprogramacion && this.citaCodigoReprogramar) {
      const codigoCita = this.citaCodigoReprogramar;
      this.citaService.editarCita(codigoCita, this.nuevaCita).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarCitas();

          Swal.fire({
            title: 'Reprogramada',
            text: 'La cita ha sido reprogramada exitosamente. ¿Desea ver el nuevo comprobante?',
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Ver Comprobante',
            cancelButtonText: 'Cerrar',
          }).then((result) => {
            if (result.isConfirmed) {
              this.verComprobante(codigoCita);
            }
          });
        },
      });
    } else {
      const hora = this.nuevaCita.hora;
      if (hora < '08:00' || hora > '20:00') {
        Swal.fire(
          'Horario inválido',
          'Las citas solo pueden agendarse entre 8:00 AM y 8:00 PM.',
          'warning',
        );
        return;
      }

      this.citaService.registrarCita(this.nuevaCita).subscribe({
        next: (response) => {
          this.cerrarModal();
          this.cargarCitas();

          if (response && response.codigoCita) {
            Swal.fire({
              title: 'Éxito',
              text: 'Cita registrada correctamente. ¿Desea ver el comprobante?',
              icon: 'success',
              showCancelButton: true,
              confirmButtonText: '👁️ Ver Comprobante',
              cancelButtonText: 'Cerrar',
            }).then((result) => {
              if (result.isConfirmed) {
                this.verComprobante(response.codigoCita);
              }
            });
          } else {
            Swal.fire('Éxito', 'Cita registrada correctamente', 'success');
          }
        },
      });
    }
  }

  verComprobante(codigoCita: string): void {
    this.citaService.descargarComprobante(codigoCita).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () =>
        Swal.fire('Error', 'No se pudo visualizar el comprobante', 'error'),
    });
  }

  confirmarEliminacion(codigoCita: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esto liberará el horario y eliminará el registro permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.citaService.eliminarCita(codigoCita).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El horario ha sido liberado.', 'success');
            this.cargarCitas();
          },
          error: () =>
            Swal.fire('Error', 'No se pudo eliminar la cita', 'error'),
        });
      }
    });
  }

  verDiagnostico(cita: CitaResponseDTO): void {
    if (!cita.codigoConsulta) {
      Swal.fire('Atención', 'No se encontró un diagnóstico asociado a esta cita.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Cargando diagnóstico...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.consultaService.buscarPorCodigo(cita.codigoConsulta).subscribe({
      next: (consulta: any) => {
        Swal.fire({
          title: `<i class="bi bi-clipboard2-pulse"></i> Resultado del Diagnóstico`,
          html: `
            <div class="text-start border-top pt-3">
              <div class="mb-3">
                <label class="fw-bold text-primary"><i class="bi bi-info-circle"></i> Motivo:</label>
                <div class="p-2 bg-light rounded">${consulta.motivo}</div>
              </div>
              <div class="mb-3">
                <label class="fw-bold text-danger"><i class="bi bi-exclamation-triangle"></i> Diagnóstico:</label>
                <div class="p-2 bg-light rounded border-start border-4 border-danger">${consulta.diagnostico}</div>
              </div>
              <div class="mb-3">
                <label class="fw-bold text-success"><i class="bi bi-capsule"></i> Tratamiento:</label>
                <div class="p-2 bg-light rounded border-start border-4 border-success">${consulta.tratamiento}</div>
              </div>
              ${consulta.observaciones ? `
              <div class="mb-0">
                <label class="fw-bold text-secondary"><i class="bi bi-journal-text"></i> Observaciones:</label>
                <div class="p-2 bg-light rounded">${consulta.observaciones}</div>
              </div>` : ''}
            </div>
          `,
          width: '600px',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#667eea',
          footer: `
            <div class="d-flex gap-2">
              <button id="btn-re-pdf" class="btn btn-sm btn-link text-danger"><i class="bi bi-file-pdf"></i> Descargar Receta</button>
            </div>
          `,
          didOpen: () => {
             const btnRePdf = document.getElementById('btn-re-pdf');
             if (btnRePdf) {
               btnRePdf.addEventListener('click', () => {
                  this.descargarReceta(cita.codigoConsulta!);
               });
             }
          }
        });
      },
      error: () => Swal.fire('Error', 'No se pudo cargar el diagnóstico', 'error')
    });
  }

  descargarReceta(codigoConsulta: string): void {
    this.consultaService.descargarRecetaPdf(codigoConsulta).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receta_${codigoConsulta}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => Swal.fire('Error', 'No se pudo descargar la receta', 'error'),
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.resetFormulario();
  }

  resetFormulario() {
    this.nuevaCita = {
      fecha: '',
      hora: '',
      motivo: '',
      pacienteCodigo: '',
      veterinarioDni: '',
      duracionMinutos: 30,
    };
    this.dniBusqueda = '';
    this.nombreClienteEncontrado = ''; 
    this.clienteNoEncontrado = false; 
    this.clientesSugeridos = [];
    this.pacientes = [];
    this.esReprogramacion = false;
    this.citaCodigoReprogramar = null;
    this.especialidadSeleccionada = '';
    this.filtrarVeterinarios();
  }
}
