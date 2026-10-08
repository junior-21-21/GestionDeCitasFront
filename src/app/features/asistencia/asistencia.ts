import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AsistenciaService } from '../../services/asistencia.service';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistencia.html',
  styleUrls: ['./asistencia.scss']
})
export class AsistenciaComponent implements OnInit {
  asistencias: any[] = [];
  horarios: any[] = [];
  usuarios: any[] = [];
  tabActiva: string = 'asistencias';
  searchTerm: string = '';
  filtroRol: string = 'TODOS';
  filtroMes: string = '';
  filtroDia: string = '';
  filtroEmpleadoId: string = '';

  nuevoHorario = {
    usuarioId: '',
    diasSemana: [] as string[],
    horaInicio: '08:00',
    horaFin: '14:00'
  };

  diasSemanaList = [
    { id: 'MONDAY', label: 'Lunes' },
    { id: 'TUESDAY', label: 'Martes' },
    { id: 'WEDNESDAY', label: 'Miércoles' },
    { id: 'THURSDAY', label: 'Jueves' },
    { id: 'FRIDAY', label: 'Viernes' },
    { id: 'SATURDAY', label: 'Sábado' },
    { id: 'SUNDAY', label: 'Domingo' }
  ];

  constructor(private asistenciaService: AsistenciaService) {}

  ngOnInit(): void {
    this.cargarAsistencias();
    this.cargarHorarios();
    this.cargarUsuarios();
  }

  cargarAsistencias() {
    this.asistenciaService.listarTodas().subscribe({
      next: (data) => this.asistencias = data,
      error: (err) => console.error('Error al cargar asistencias', err)
    });
  }

  cargarHorarios() {
    this.asistenciaService.listarHorarios().subscribe({
      next: (data) => this.horarios = data,
      error: (err) => console.error('Error al cargar horarios', err)
    });
  }

  cargarUsuarios() {
    this.asistenciaService.listarUsuarios().subscribe({
      next: (data) => this.usuarios = data,
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  guardarNuevoHorario() {
    if (!this.nuevoHorario.usuarioId) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: 'Debes seleccionar un empleado.' });
      return;
    }
    if (this.nuevoHorario.diasSemana.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: 'Debes seleccionar al menos un día.' });
      return;
    }
    this.asistenciaService.guardarHorario(this.nuevoHorario).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Guardado!',
          text: 'Horario asignado correctamente.',
          timer: 2000,
          showConfirmButton: false
        });
        this.cargarHorarios(); // Refrescar tabla
      },
      error: (err) => {
        console.error('Error guardando', err);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el horario.' });
      }
    });
  }

  cambiarTab(tab: string) {
    this.tabActiva = tab;
  }

  exportarPdf() {
    this.asistenciaService.descargarPdf().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      },
      error: (err) => {
        console.error('Error al descargar PDF:', err);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo generar el PDF.' });
      }
    });
  }

  toggleDia(dia: string) {
    const idx = this.nuevoHorario.diasSemana.indexOf(dia);
    if(idx > -1) this.nuevoHorario.diasSemana.splice(idx, 1);
    else this.nuevoHorario.diasSemana.push(dia);
  }

  formatTo12Hour(timeStr: string): string {
    if (!timeStr) return '';
    const [hourStr, minStr] = timeStr.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    const formattedHour = hour < 10 ? '0' + hour : hour.toString();
    return `${formattedHour}:${minStr} ${ampm}`;
  }

  get horariosAgrupados() {
    let filtrados = this.horarios;
    if (this.filtroRol !== 'TODOS') {
      filtrados = filtrados.filter(h => h.usuario?.rol?.nombre === this.filtroRol);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtrados = filtrados.filter(h => h.usuario?.nombres?.toLowerCase().includes(term));
    }

    // Agrupar por empleado
    const mapa = new Map<number, any>();
    for(let h of filtrados) {
      if(!mapa.has(h.usuario.id)) {
        mapa.set(h.usuario.id, {
          usuario: h.usuario,
          dias: {}
        });
      }
      mapa.get(h.usuario.id).dias[h.diaSemana] = {
        id: h.id,
        texto: `${this.formatTo12Hour(h.horaInicio)} - ${this.formatTo12Hour(h.horaFin)}`
      };
    }
    return Array.from(mapa.values());
  }

  eliminarHorario(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Eliminarás este horario y no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.asistenciaService.eliminarHorario(id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Horario borrado', timer: 1500, showConfirmButton: false });
            this.cargarHorarios();
          },
          error: (err) => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el horario' })
        });
      }
    });
  }

  get asistenciasFiltradas() {
    let filtradas = this.asistencias;

    if (this.filtroRol !== 'TODOS') {
      filtradas = filtradas.filter(a => a.usuario?.rol?.nombre === this.filtroRol);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtradas = filtradas.filter(a => 
        a.usuario?.nombres?.toLowerCase().includes(term) || 
        a.usuario?.rol?.nombre?.toLowerCase().includes(term)
      );
    }

    if (this.filtroMes) {
      filtradas = filtradas.filter(a => a.fecha && a.fecha.toString().startsWith(this.filtroMes));
    }
    
    if (this.filtroDia) {
      filtradas = filtradas.filter(a => a.fecha && a.fecha.toString() === this.filtroDia);
    }

    if (this.filtroEmpleadoId) {
      filtradas = filtradas.filter(a => a.usuario?.id?.toString() === this.filtroEmpleadoId.toString());
    }

    return filtradas;
  }

  limpiarFiltrosFecha() {
    this.filtroMes = '';
    this.filtroDia = '';
    this.filtroEmpleadoId = '';
  }

  exportarAsistenciasPdf() {
    const ids = this.asistenciasFiltradas.map(a => a.id);
    if (ids.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: 'No hay registros de asistencia con estos filtros para exportar.' });
      return;
    }
    this.asistenciaService.exportarAsistenciasPdf(ids).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      },
      error: (err) => {
        console.error(err);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo generar el reporte PDF.' });
      }
    });
  }

  get horariosFiltrados() {
    let filtrados = this.horarios;

    if (this.filtroRol !== 'TODOS') {
      filtrados = filtrados.filter(h => h.usuario?.rol?.nombre === this.filtroRol);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtrados = filtrados.filter(h => 
        h.usuario?.nombres?.toLowerCase().includes(term) ||
        h.diaSemana?.toLowerCase().includes(term)
      );
    }
    return filtrados;
  }
}
