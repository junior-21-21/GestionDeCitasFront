import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaProductoService } from '../../services/categoria-producto.service';
import { CategoriaProductoDTO } from '../../models/categoria-producto.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.html',
  styleUrls: ['./categorias.scss']
})
export class CategoriasComponent implements OnInit {
  categorias: CategoriaProductoDTO[] = [];
  nueva: CategoriaProductoDTO = { nombre: '', descripcion: '' };
  editando: CategoriaProductoDTO | null = null;

  constructor(private categoriaService: CategoriaProductoService) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.categoriaService.listarTodos().subscribe({
      next: (data) => this.categorias = data,
      error: () => Swal.fire('Error', 'No se pudieron cargar las categorías', 'error')
    });
  }

  guardar(): void {
    if (!this.nueva.nombre.trim()) {
      Swal.fire('Atención', 'El nombre de la categoría es obligatorio', 'warning');
      return;
    }

    if (this.editando && this.editando.id) {
      this.categoriaService.actualizar(this.editando.id, this.nueva).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Actualizada', text: 'Categoría actualizada correctamente', timer: 1500, showConfirmButton: false });
          this.cancelarEdicion();
          this.cargarCategorias();
        },
        error: (err) => Swal.fire('Error', err.error || 'No se pudo actualizar', 'error')
      });
    } else {
      this.categoriaService.crear(this.nueva).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Registrada', text: 'Categoría creada correctamente', timer: 1500, showConfirmButton: false });
          this.limpiar();
          this.cargarCategorias();
        },
        error: (err) => Swal.fire('Error', err.error || 'No se pudo registrar', 'error')
      });
    }
  }

  editar(cat: CategoriaProductoDTO): void {
    this.editando = cat;
    this.nueva = { ...cat };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.editando = null;
    this.limpiar();
  }

  eliminar(id: number): void {
    Swal.fire({
      title: '¿Eliminar categoría?',
      text: 'Los productos asociados podrían verse afectados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoriaService.eliminar(id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Eliminada', text: 'Categoría eliminada', timer: 1500, showConfirmButton: false });
            this.cargarCategorias();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar (posiblemente tiene productos asociados)', 'error')
        });
      }
    });
  }

  limpiar(): void {
    this.nueva = { nombre: '', descripcion: '' };
  }
}
