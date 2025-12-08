import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../services/cita.service';
import { MascotaService } from '../../services/mascota.service';
import { VeterinarioService } from '../../services/veterinario.service';
import { EspecialidadService } from '../../services/especialidad.service'; // Importante
import { CitaDTO } from '../../models/cita-dto.model';
import { CitaResponseDTO } from '../../models/cita-response.model';
import Swal from 'sweetalert2';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './citas.html',
  styleUrls: ['./citas.scss']
})
export class CitasComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    locale: esLocale,
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    },
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    },
    height: 'auto',
    weekends: true,
    editable: false,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    events: []
  };

  mascotas: any[] = [];
  veterinarios: any[] = [];
  
  // Filtros y Especialidades
  especialidades: any[] = [];
  especialidadSeleccionada: string = '';
  veterinariosFiltrados: any[] = [];

  // Buscador
  dniBusqueda: string = '';
  buscandoMascotas: boolean = false;

  nuevaCita: CitaDTO = {
    fecha: '',
    hora: '',
    motivo: '',
    mascotaId: 0,
    veterinarioId: 0,
    duracionMinutos: 30
  };

  // UI States
  mostrarModal: boolean = false; 
  esReprogramacion: boolean = false;
  citaIdReprogramar: number | null = null;

  duraciones = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '1 hora', value: 60 }
  ];

  constructor(
    private citaService: CitaService,
    private mascotaService: MascotaService,
    private veterinarioService: VeterinarioService,
    private especialidadService: EspecialidadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCitas();
    this.cargarVeterinarios();
    this.cargarEspecialidades();
  }

  cargarEspecialidades(): void {
    this.especialidadService.listar().subscribe(data => this.especialidades = data);
  }

  cargarVeterinarios(): void {
    this.veterinarioService.listar().subscribe(data => {
      this.veterinarios = data;
      this.veterinariosFiltrados = data;
    });
  }

  filtrarVeterinarios(): void {
    if (this.especialidadSeleccionada) {
       this.veterinariosFiltrados = this.veterinarios.filter(v => 
          v.especialidad === this.especialidadSeleccionada
       );
    } else {
       this.veterinariosFiltrados = [...this.veterinarios];
    }
    
    // Si el veterinario seleccionado ya no es válido, resetear
    const vetEnLista = this.veterinariosFiltrados.find(v => v.id == this.nuevaCita.veterinarioId);
    if (!vetEnLista) {
       this.nuevaCita.veterinarioId = 0;
    }
  }

  cargarCitas(): void {
    this.citaService.listarResumen().subscribe({
      next: (data: CitaResponseDTO[]) => {
        this.calendarOptions.events = data.map(cita => {
          const duracion = cita.duracionMinutos || 30;
          // Calcular fecha fin forzando interpretación de fechas sin zona horaria
          const fechaInicio = new Date(`${cita.fecha}T${cita.hora}`);
          const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);
          
          // Formatear manualmente a ISO para evitar líos de zona
          // Sin embargo, FullCalendar acepta Strings ISO.
          // Mejor enfoque: calcular hora fin en string
          const [hora, min] = cita.hora.split(':').map(Number);
          const totalMin = hora * 60 + min + duracion;
          const horaFin = Math.floor(totalMin / 60);
          const minFin = totalMin % 60;
          const horaFinStr = `${horaFin.toString().padStart(2, '0')}:${minFin.toString().padStart(2, '0')}:00`;

          return {
            id: cita.id.toString(),
            title: `${cita.nombreMascota} - ${cita.nombreVeterinario}`,
            start: `${cita.fecha}T${cita.hora}`,
            end: `${cita.fecha}T${horaFinStr}`, // Fin calculado
            color: this.getColorEstado(cita.estado),
            extendedProps: { ...cita } // Guardar toda la data
          };
        });
      },
      error: () => Swal.fire('Error', '❌ Error al cargar citas', 'error')
    });
  }

  getColorEstado(estado: string): string {
    switch(estado) {
      case 'PENDIENTE': return '#3788d8'; // Azul
      case 'REALIZADA': return '#28a745'; // Verde
      case 'CANCELADA': return '#dc3545'; // Rojo
      case 'REPROGRAMADO': return '#ffc107'; // Amarillo
      default: return '#6c757d';
    }
  }

  buscarMascotas(): void {
    if (!this.dniBusqueda.trim()) {
       Swal.fire('Atención', 'Ingrese un DNI para buscar', 'warning');
       return;
    }
    
    this.buscandoMascotas = true;
    this.mascotaService.buscarPorDni(this.dniBusqueda).subscribe({
      next: (data) => {
        this.mascotas = data;
        this.buscandoMascotas = false;
        if (data.length === 0) {
          Swal.fire('Sin resultados', 'No se encontraron mascotas para este DNI', 'info');
        }
      },
      error: () => {
        this.buscandoMascotas = false;
        Swal.fire('Error', 'Error al buscar mascotas', 'error');
      }
    });
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    // Validar fecha futura
    // Validar fecha futura (SOLUCIÓN CORREGIDA)
    const fechaSeleccionadaStr = selectInfo.startStr.split('T')[0]; // "YYYY-MM-DD"
    const fechaActualStr = new Date().toLocaleDateString('en-CA'); // "YYYY-MM-DD" en zona local (formato ISO)

    if (fechaSeleccionadaStr < fechaActualStr) {
      Swal.fire('Fecha inválida', 'No puede agendar citas en el pasado.', 'warning');
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
      title: `Cita #${cita.id}`,
      html: `
        <div class="text-start">
          <p><strong>Mascota:</strong> ${cita.nombreMascota}</p>
          <p><strong>Veterinario:</strong> ${cita.nombreVeterinario}</p>
          <p><strong>Motivo:</strong> ${cita.motivo}</p>
          <p><strong>Estado:</strong> <span class="badge ${this.getBadgeClass(cita.estado)}">${cita.estado}</span></p>
        </div>
      `,
      showDenyButton: !esRealizada,
      showCancelButton: true,
      showConfirmButton: !esRealizada && cita.estado !== 'CANCELADA', // Ocultar si está cancelada
      confirmButtonText: '✅ Atender',
      denyButtonText: '🚫 Cancelar',
      cancelButtonText: esRealizada ? 'Cerrar' : 'Cerrar',
      footer: esRealizada ? '<button id="btn-descargar-pdf" class="btn btn-sm btn-outline-danger"><i class="bi bi-file-pdf"></i> Descargar Comprobante</button>' : 
              (cita.estado === 'CANCELADA' ? 
                '<button id="btn-eliminar" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i> Liberar Horario</button>' :
                '<button id="btn-reprogramar" class="btn btn-sm btn-outline-warning"><i class="bi bi-calendar-event"></i> Reprogramar</button>')
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirigir a Consultas para atender la cita
        this.router.navigate(['/consultas'], { queryParams: { citaId: cita.id } });
      } else if (result.isDenied) {
        // Bloquear si ya está cancelada (aunque el botón deny podría ocultarse también, pero por seguridad)
        if (cita.estado !== 'CANCELADA') {
            this.cambiarEstado(cita.id, 'CANCELADA');
        }
      }
    });

    // Event Listeners para botones del footer (Hack de SweetAlert2)
    setTimeout(() => {
      const btnPdf = document.getElementById('btn-descargar-pdf');
      if (btnPdf) {
        btnPdf.addEventListener('click', () => {
          Swal.close();
          this.descargarComprobante(cita.id);
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
          this.confirmarEliminacion(cita.id);
        });
      }
    }, 100);
  }

  getBadgeClass(estado: string): string {
    switch(estado) {
      case 'PENDIENTE': return 'bg-primary';
      case 'REALIZADA': return 'bg-success';
      case 'CANCELADA': return 'bg-danger';
      case 'REPROGRAMADO': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  cambiarEstado(id: number, estado: string): void {
    this.citaService.cambiarEstado(id, estado).subscribe({
      next: () => {
        Swal.fire('Actualizado', `Cita marcada como ${estado}`, 'success');
        this.cargarCitas();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  descargarComprobante(id: number): void {
    this.citaService.descargarComprobante(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comprobante_cita_${id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => Swal.fire('Error', 'No se pudo descargar el comprobante', 'error')
    });
  }

  prepararReprogramacion(cita: CitaResponseDTO): void {
    this.esReprogramacion = true;
    this.citaIdReprogramar = cita.id;
    
    // Asignamos datos básicos
    this.nuevaCita.fecha = cita.fecha;
    this.nuevaCita.hora = cita.hora;
    this.nuevaCita.motivo = cita.motivo;

    // Asignamos IDs (ahora vienen en el DTO)
    this.nuevaCita.mascotaId = cita.mascotaId || 0;
    this.nuevaCita.veterinarioId = cita.veterinarioId || 0;

    // Lógica para preseleccionar la especialidad si el veterinario la tiene
    const vet = this.veterinarios.find(v => v.id === this.nuevaCita.veterinarioId);
    if (vet) {
      this.especialidadSeleccionada = vet.especialidad || '';
      this.filtrarVeterinarios();
    } else {
      this.especialidadSeleccionada = '';
      this.filtrarVeterinarios();
    }

    this.mostrarModal = true;
    Swal.fire('Reprogramar', 'Modifique la fecha u hora según necesite.', 'info');
  }

  guardarCita(): void {
    if (this.esReprogramacion && this.citaIdReprogramar) {
      const idCita = this.citaIdReprogramar; // Capturar ID antes de resetear
      // PROCESO DE REPROGRAMACIÓN
      this.citaService.editarCita(idCita, this.nuevaCita).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarCitas();

          Swal.fire({
            title: 'Reprogramada',
            text: 'La cita ha sido reprogramada exitosamente. ¿Desea ver el nuevo comprobante?',
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Ver Comprobante',
            cancelButtonText: 'Cerrar'
          }).then((result) => {
            if (result.isConfirmed) {
              this.verComprobante(idCita);
            }
          });
        }
      });
    } else {
      // REGISTRO NORMAL
      // Validar Horario (8 AM - 8 PM)
      const hora = this.nuevaCita.hora;
      if (hora < '08:00' || hora > '20:00') {
          Swal.fire('Horario inválido', 'Las citas solo pueden agendarse entre 8:00 AM y 8:00 PM.', 'warning');
          return;
      }

      this.citaService.registrarCita(this.nuevaCita).subscribe({
         next: (response) => {
           this.cerrarModal();
           this.cargarCitas();
           
           if (response && response.id) {
             Swal.fire({
               title: 'Éxito',
               text: 'Cita registrada correctamente. ¿Desea ver el comprobante?',
               icon: 'success',
               showCancelButton: true,
               confirmButtonText: '👁️ Ver Comprobante',
               cancelButtonText: 'Cerrar'
             }).then((result) => {
               if (result.isConfirmed) {
                 this.verComprobante(response.id);
               }
             });
           } else {
             Swal.fire('Éxito', 'Cita registrada correctamente', 'success');
           }
         }
      });
    }
  }

  verComprobante(id: number): void {
    this.citaService.descargarComprobante(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () => Swal.fire('Error', 'No se pudo visualizar el comprobante', 'error')
    });
  }

  confirmarEliminacion(id: number): void {
      Swal.fire({
          title: '¿Estás seguro?',
          text: "Esto liberará el horario y eliminará el registro permanentemente.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
      }).then((result) => {
          if (result.isConfirmed) {
              this.citaService.eliminarCita(id).subscribe({
                  next: () => {
                      Swal.fire('Eliminado', 'El horario ha sido liberado.', 'success');
                      this.cargarCitas();
                  },
                  error: () => Swal.fire('Error', 'No se pudo eliminar la cita', 'error')
              });
          }
      });
  }

  cerrarModal() { 
    this.mostrarModal = false; 
    this.resetFormulario();
  }
  
  resetFormulario() {
    this.nuevaCita = { fecha: '', hora: '', motivo: '', mascotaId: 0, veterinarioId: 0, duracionMinutos: 30 };
    this.dniBusqueda = '';
    this.mascotas = [];
    this.esReprogramacion = false;
    this.citaIdReprogramar = null;
    this.especialidadSeleccionada = '';
    this.filtrarVeterinarios(); // Restaura la lista completa
  }
}
