import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../services/producto';
import { CategoriaService } from '../services/categoria';
import { Producto, TipoProducto } from '../models/producto.interface';
import { Categoria } from '../models/categoria.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrls: ['./productos.scss']
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  
  productoActual: Partial<Producto> = this.resetProducto();
  modoEdicion = false;
  mostrarModal = false;
  
  tiposProducto = Object.values(TipoProducto);

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarProductos() {
    this.productoService.obtenerTodos().subscribe({
      next: (data) => this.productos = data,
      error: (err) => Swal.fire('Error', 'No se pudieron cargar los productos', 'error')
    });
  }

  cargarCategorias() {
    this.categoriaService.obtenerTodas().subscribe({
      next: (data) => this.categorias = data,
      error: (err) => console.error('Error cargando categorias', err)
    });
  }

  abrirModalNuevo() {
    this.productoActual = this.resetProducto();
    this.modoEdicion = false;
    this.mostrarModal = true;
  }

  abrirModalEditar(producto: Producto) {
    this.productoActual = { ...producto };
    this.modoEdicion = true;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardar() {
    if (!this.productoActual.codigo || !this.productoActual.nombre || !this.productoActual.categoria) {
      Swal.fire('Atención', 'Complete los campos obligatorios', 'warning');
      return;
    }

    const guardarObs = this.modoEdicion && this.productoActual.id
      ? this.productoService.actualizar(this.productoActual.id, this.productoActual as Producto)
      : this.productoService.crear(this.productoActual as Producto);

    guardarObs.subscribe({
      next: () => {
        Swal.fire('Éxito', 'Producto guardado correctamente', 'success');
        this.cerrarModal();
        this.cargarProductos();
      },
      error: (err) => {
        Swal.fire('Error', err.error || 'Ocurrió un error al guardar', 'error');
      }
    });
  }

  eliminar(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esto",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productoService.eliminar(id).subscribe({
          next: () => {
            Swal.fire('Eliminado!', 'El producto ha sido eliminado.', 'success');
            this.cargarProductos();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el producto', 'error')
        });
      }
    });
  }

  resetProducto(): Partial<Producto> {
    return {
      codigo: '',
      nombre: '',
      descripcion: '',
      precioCompra: 0,
      precioVenta: 0,
      stock: 0,
      stockMinimo: 0,
      tipo: TipoProducto.INSUMO_MEDICO
    };
  }

  getClaseStock(producto: Producto): string {
    if (producto.stock <= 0) return 'text-danger fw-bold';
    if (producto.stock <= producto.stockMinimo) return 'text-warning fw-bold';
    return 'text-success';
  }
}
