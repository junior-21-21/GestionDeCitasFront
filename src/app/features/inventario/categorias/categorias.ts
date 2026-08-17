import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../services/categoria';
import { Categoria } from '../models/categoria.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.html',
  styleUrls: ['./categorias.scss']
})
export class CategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  
  categoriaActual: Partial<Categoria> = this.resetCategoria();
  modoEdicion = false;
  mostrarModal = false;

  constructor(private categoriaService: CategoriaService) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.categoriaService.obtenerTodas().subscribe({
      next: (data) => this.categorias = data,
      error: (err) => Swal.fire('Error', 'No se pudieron cargar las categorías', 'error')
    });
  }

  abrirModalNuevo() {
    this.categoriaActual = this.resetCategoria();
    this.modoEdicion = false;
    this.mostrarModal = true;
  }

  abrirModalEditar(categoria: Categoria) {
    this.categoriaActual = { ...categoria };
    this.modoEdicion = true;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardar() {
    if (!this.categoriaActual.nombre) {
      Swal.fire('Atención', 'El nombre es obligatorio', 'warning');
      return;
    }

    const guardarObs = this.modoEdicion && this.categoriaActual.id
      ? this.categoriaService.actualizar(this.categoriaActual.id, this.categoriaActual as Categoria)
      : this.categoriaService.crear(this.categoriaActual as Categoria);

    guardarObs.subscribe({
      next: () => {
        Swal.fire('Éxito', 'Categoría guardada correctamente', 'success');
        this.cerrarModal();
        this.cargarCategorias();
      },
      error: (err) => {
        Swal.fire('Error', err.error || 'Ocurrió un error al guardar', 'error');
      }
    });
  }

  eliminar(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Si esta categoría tiene productos, no podrás eliminarla.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoriaService.eliminar(id).subscribe({
          next: () => {
            Swal.fire('Eliminado!', 'La categoría ha sido eliminada.', 'success');
            this.cargarCategorias();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar. Verifique que no tenga productos asociados.', 'error')
        });
      }
    });
  }

  resetCategoria(): Partial<Categoria> {
    return {
      nombre: '',
      descripcion: ''
    };
  }
}
