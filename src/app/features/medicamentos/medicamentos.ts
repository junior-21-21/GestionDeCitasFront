import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicamentoService } from '../../services/medicamento.service';
import { Medicamento, MedicamentoDTO } from '../../models/medicamento.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-medicamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicamentos.html',
  styleUrls: ['./medicamentos.scss']
})
export class MedicamentosComponent implements OnInit {
  medicamentos: Medicamento[] = [];
  nuevo: MedicamentoDTO = { nombre: '', descripcion: '', stock: 0, precio: 0 };
  editando: Medicamento | null = null;

  // Paginación
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  constructor(private medicamentoService: MedicamentoService) {}

  ngOnInit(): void {
    this.cargarMedicamentos();
  }

  cargarMedicamentos() {
    this.medicamentoService.listar().subscribe(meds => {
      this.medicamentos = meds;
      this.totalPages = Math.ceil(this.medicamentos.length / this.pageSize);
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages || 1;
      }
    });
  }

  get medicamentosPaginados(): Medicamento[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.medicamentos.slice(start, start + this.pageSize);
  }

  irPagina(n: number) {
    if (n >= 1 && n <= this.totalPages) {
      this.currentPage = n;
    }
  }

  registrar() {
    this.medicamentoService.crear(this.nuevo).subscribe({
      next: () => {
        this.nuevo = { nombre: '', descripcion: '', stock: 0, precio: 0 };
        this.cargarMedicamentos();
        Swal.fire({
          icon: 'success',
          title: 'Registrado',
          text: 'El medicamento fue registrado exitosamente.',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: err => {
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: err.error || 'Ocurrió un error inesperado.'
        });
      }
    });
  }

  seleccionarParaEditar(med: Medicamento) {
    this.editando = { ...med };
  }

  actualizar() {
    if (this.editando) {
      const { id, ...dto } = this.editando;
      this.medicamentoService.actualizar(id, dto).subscribe({
        next: () => {
          this.editando = null;
          this.cargarMedicamentos();
          Swal.fire({
            icon: 'success',
            title: 'Actualizado',
            text: 'El medicamento fue actualizado correctamente.',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: err => {
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
            text: err.error || 'Ocurrió un error inesperado.'
          });
        }
      });
    }
  }

  cancelarEdicion() {
    this.editando = null;
  }

  eliminar(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.medicamentoService.eliminar(id).subscribe({
          next: () => {
            this.cargarMedicamentos();
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El medicamento fue eliminado correctamente.',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: err => {
            Swal.fire({
              icon: 'error',
              title: 'Error al eliminar',
              text: err.error || 'Ocurrió un error inesperado.'
            });
          }
        });
      }
    });
  }
}
