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
  nuevaEspecialidad: Especialidad = { nombre: '' };

  constructor(private service: EspecialidadService) {}

  ngOnInit(): void {
    this.cargarEspecialidades();
  }

  cargarEspecialidades() {
    this.service.listar().subscribe({
      next: data => this.especialidades = data,
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

    this.service.crear(this.nuevaEspecialidad).subscribe({
      next: () => {
        Swal.fire('Registrado', 'Especialidad creada correctamente.', 'success');
        this.nuevaEspecialidad.nombre = '';
        this.cargarEspecialidades();
      },
      error: err => {
        Swal.fire('Error', 'No se pudo crear la especialidad.', 'error');
        console.error(err);
      }
    });
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
