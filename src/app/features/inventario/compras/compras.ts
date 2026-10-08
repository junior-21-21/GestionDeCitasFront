import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompraService, CompraDTO, ProveedorDTO, CompraDetalleDTO } from '../../../services/compra.service';
import { ProductoService } from '../../../services/producto.service';
import { ProductoDTO } from '../../../models/producto.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compras.html',
  styleUrls: ['./compras.scss']
})
export class ComprasComponent implements OnInit {
  compras: CompraDTO[] = [];
  productos: ProductoDTO[] = [];
  proveedores: ProveedorDTO[] = []; // En un caso real usarías un ProveedorService
  
  // Variables del formulario
  mostrarFormulario = false;
  nuevaCompra: CompraDTO = {
    numeroFactura: '',
    proveedor: { id: 1, nombre: 'Proveedor General' }, // Dummy
    detalles: []
  };

  productoSeleccionadoId: number | null = null;
  cantidadActual = 1;
  precioUnitarioActual = 0;
  loteActual = '';
  vencimientoActual = '';

  constructor(
    private compraService: CompraService,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    this.cargarCompras();
    this.cargarProductos();
  }

  cargarCompras() {
    this.compraService.listarCompras().subscribe({
      next: (data) => this.compras = data,
      error: (err) => console.error(err)
    });
  }

  cargarProductos() {
    this.productoService.listarTodos().subscribe({
      next: (data) => {
        this.productos = data;
      },
      error: (err) => console.error(err)
    });
  }

  abrirFormulario() {
    this.mostrarFormulario = true;
    this.nuevaCompra = {
      numeroFactura: '',
      proveedor: { id: 1, nombre: 'Proveedor General' },
      detalles: []
    };
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
  }

  onProductoChange() {
    if (this.productoSeleccionadoId) {
      const prod = this.productos.find(p => p.id === Number(this.productoSeleccionadoId));
      if (prod) {
        this.precioUnitarioActual = prod.precioCompra || 0;
      }
    }
  }

  agregarDetalle() {
    if (!this.productoSeleccionadoId || this.cantidadActual <= 0 || this.precioUnitarioActual <= 0) {
      Swal.fire('Error', 'Complete los datos del producto correctamente', 'error');
      return;
    }

    const prod = this.productos.find(p => p.id === Number(this.productoSeleccionadoId));
    
    this.nuevaCompra.detalles.push({
      producto: { id: Number(this.productoSeleccionadoId) },
      cantidad: this.cantidadActual,
      precioUnitario: this.precioUnitarioActual,
      subtotal: this.cantidadActual * this.precioUnitarioActual,
      numeroLote: this.loteActual,
      fechaVencimiento: this.vencimientoActual
    });

    // Reset fields
    this.productoSeleccionadoId = null;
    this.cantidadActual = 1;
    this.precioUnitarioActual = 0;
    this.loteActual = '';
    this.vencimientoActual = '';
  }

  quitarDetalle(index: number) {
    this.nuevaCompra.detalles.splice(index, 1);
  }

  calcularTotal(): number {
    return this.nuevaCompra.detalles.reduce((sum, item) => sum + item.subtotal, 0);
  }

  guardarCompra() {
    if (this.nuevaCompra.detalles.length === 0) {
      Swal.fire('Error', 'Agregue al menos un producto a la compra', 'error');
      return;
    }

    this.compraService.registrarCompra(this.nuevaCompra).subscribe({
      next: (res) => {
        Swal.fire('Éxito', 'Compra registrada correctamente', 'success');
        this.cerrarFormulario();
        this.cargarCompras();
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudo registrar la compra', 'error');
      }
    });
  }
}
