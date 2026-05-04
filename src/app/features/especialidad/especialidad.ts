import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EspecialidadService } from '../../services/especialidad.service';
import { Especialidad } from '../../models/especialidad.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-especialidades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './especialidad.html',
  styleUrls: ['./especialidad.scss']
})
export class EspecialidadesComponent implements OnInit {
  especialidades: Especialidad[] = [];
  especialidadesFiltradas: Especialidad[] = []; // Lista filtrada
  filtroBusqueda: string = ''; // Texto del buscador
  nuevaEspecialidad: Especialidad = { nombre: '' };
  modoEdicion: boolean = false; // Bandera para saber si estamos editando

  constructor(private service: EspecialidadService) {}

  ngOnInit(): void {
    this.cargarEspecialidades();
  }

  cargarEspecialidades() {
    this.service.listar().subscribe({
      next: data => {
        this.especialidades = data;
        this.filtrar(); // Aplicar filtro inicial
      },
      error: err => {
        console.error(err);
        Swal.fire('Error', 'No se pudo cargar especialidades.', 'error');
      }
    });
  }

  registrar() {
    if (!this.nuevaEspecialidad.nombre.trim()) {
      Swal.fire('Atención', 'El nombre no puede estar vacío.', 'warning');
      return;
    }

    if (this.modoEdicion) {
      // ACTUALIZAR
      this.service.actualizar(this.nuevaEspecialidad.id!, this.nuevaEspecialidad).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Actualizado',
            text: 'Especialidad actualizada correctamente.',
            timer: 2000,
            showConfirmButton: false
          });
          this.cancelarEdicion();
          this.cargarEspecialidades();
        },
        error: (err: any) => {
          Swal.fire('Error', 'No se pudo actualizar la especialidad.', 'error');
          console.error(err);
        }
      });
    } else {
      // CREAR
      this.service.crear(this.nuevaEspecialidad).subscribe({
        next: (resp) => {
          Swal.fire({
            icon: 'success',
            title: 'Registrado',
            text: 'Especialidad creada correctamente.',
            timer: 2000,
            showConfirmButton: false
          });
          this.nuevaEspecialidad = { nombre: '' };
          this.cargarEspecialidades();
        },
        error: err => {
          Swal.fire('Error', 'No se pudo crear la especialidad.', 'error');
          console.error(err);
        }
      });
    }
  }

  editar(esp: Especialidad) {
    // Copiamos el objeto para no modificar la tabla directamente mientras editamos
    this.nuevaEspecialidad = { ...esp };
    this.modoEdicion = true;
  }

  cancelarEdicion() {
    this.nuevaEspecialidad = { nombre: '' };
    this.modoEdicion = false;
  }

  filtrar(): void {
    if (!this.filtroBusqueda) {
      this.especialidadesFiltradas = this.especialidades;
      return;
    }
    const termino = this.filtroBusqueda.toLowerCase();
    this.especialidadesFiltradas = this.especialidades.filter(e => 
      e.nombre.toLowerCase().includes(termino)
    );
  }

  obtenerIcono(nombre: string): string {
    const nombreLower = nombre.toLowerCase();
    
    if (nombreLower.includes('cardio') || nombreLower.includes('coraz')) return 'bi-heart-pulse-fill';
    if (nombreLower.includes('derma') || nombreLower.includes('piel')) return 'bi-person-bounding-box';
    if (nombreLower.includes('cirug') || nombreLower.includes('quiru') || nombreLower.includes('opera')) return 'bi-scissors';
    if (nombreLower.includes('oftal') || nombreLower.includes('ojos') || nombreLower.includes('vista')) return 'bi-eye-fill';
    if (nombreLower.includes('onco') || nombreLower.includes('cancer') || nombreLower.includes('tumor')) return 'bi-activity'; // O bi-virus
    if (nombreLower.includes('odon') || nombreLower.includes('dient') || nombreLower.includes('boca')) return 'bi-gem'; 
    if (nombreLower.includes('trauma') || nombreLower.includes('hueso') || nombreLower.includes('fractura') || nombreLower.includes('orto')) return 'bi-bandaid-fill';
    if (nombreLower.includes('neuro') || nombreLower.includes('cerebro') || nombreLower.includes('nervio')) return 'bi-cpu-fill'; 
    if (nombreLower.includes('gastro') || nombreLower.includes('estomago') || nombreLower.includes('digest')) return 'bi-egg-fried'; 
    if (nombreLower.includes('radio') || nombreLower.includes('rayos') || nombreLower.includes('imagen')) return 'bi-wifi'; 
    if (nombreLower.includes('fisiot') || nombreLower.includes('rehab')) return 'bi-bicycle'; 
    if (nombreLower.includes('vacun') || nombreLower.includes('inmun')) return 'bi-eyedropper'; 
    if (nombreLower.includes('nutri') || nombreLower.includes('aliem')) return 'bi-apple'; 
    if (nombreLower.includes('emergen') || nombreLower.includes('urgen')) return 'bi-exclamation-triangle-fill'; 
    if (nombreLower.includes('pedia') || nombreLower.includes('cachorro')) return 'bi-emoji-smile-fill'; 
    if (nombreLower.includes('geriat') || nombreLower.includes('mayor')) return 'bi-hourglass-bottom'; 
    if (nombreLower.includes('lab') || nombreLower.includes('analisis')) return 'bi-file-earmark-medical-fill'; 
    if (nombreLower.includes('felino') || nombreLower.includes('gato')) return 'bi-chat-heart-fill'; 
    if (nombreLower.includes('exotic')) return 'bi-bug-fill'; 
    
    return 'bi-hospital-fill'; // Icono por defecto
  }

  eliminar(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.service.eliminar(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Especialidad eliminada correctamente.', 'success');
            this.cargarEspecialidades();
          },
          error: err => {
            Swal.fire('Error', 'No se pudo eliminar la especialidad.', 'error');
            console.error(err);
          }
        });
      }
    });
  }
}
