import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CobroConsultaService, CobroConsulta } from '../../services/cobro.service';
import { VentaService, Venta, DetalleVenta } from '../../services/venta.service';
import { ProductoService } from '../../services/producto.service';
import { ProductoDTO } from '../../models/producto.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './caja.html',
  styleUrls: ['./caja.scss']
})
export class CajaComponent implements OnInit {
  // --- COBROS PENDIENTES ---
  cobrosPendientes: CobroConsulta[] = [];
  cargando = false;

  // --- VENTA DIRECTA (POS) ---
  modoActivo: 'cobros' | 'venta' = 'cobros';
  
  // Productos disponibles
  productosTodos: ProductoDTO[] = [];
  productosFiltrados: ProductoDTO[] = [];
  busquedaPOS: string = '';
  
  // Carrito
  carrito: DetalleVenta[] = [];
  totalVenta: number = 0;
  ventaNueva: Venta = { detalles: [] };
  procesandoVenta = false;

  constructor(
    private cobroService: CobroConsultaService,
    private ventaService: VentaService,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    this.cargarPendientes();
    this.cargarProductos();
  }

  setModo(modo: 'cobros' | 'venta') {
    this.modoActivo = modo;
    if (modo === 'venta' && this.productosTodos.length === 0) {
      this.cargarProductos();
    }
  }

  cargarPendientes(): void {
    this.cargando = true;
    this.cobroService.listarPendientes().subscribe({
      next: (data) => {
        this.cobrosPendientes = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando cobros pendientes', err);
        this.cargando = false;
        Swal.fire('Error', 'No se pudieron cargar los cobros pendientes.', 'error');
      }
    });
  }

  // --- LÓGICA VENTA DIRECTA ---

  cargarProductos(): void {
    this.productoService.listarTodos().subscribe({
      next: (data) => {
        // Solo productos con stock y que estén activos
        this.productosTodos = data.filter(p => p.stock! > 0 && p.activo);
        this.productosFiltrados = [...this.productosTodos];
      },
      error: () => {
        console.error('Error cargando productos para venta');
      }
    });
  }

  filtrarProductosPOS(): void {
    const term = this.busquedaPOS.toLowerCase().trim();
    if (!term) {
      this.productosFiltrados = [...this.productosTodos];
      return;
    }
    this.productosFiltrados = this.productosTodos.filter(p => 
      p.nombre?.toLowerCase().includes(term) || p.codigo?.toLowerCase().includes(term)
    );
  }

  agregarAlCarrito(producto: ProductoDTO): void {
    const existente = this.carrito.find(item => item.producto.id === producto.id);
    
    if (existente) {
      if (existente.cantidad < producto.stock!) {
        existente.cantidad++;
        existente.subtotal = existente.cantidad * existente.precioUnitario;
      } else {
        Swal.fire('Atención', 'No hay más stock disponible de este producto', 'warning');
      }
    } else {
      this.carrito.push({
        producto: { id: producto.id!, nombre: producto.nombre, precioVenta: producto.precioVenta },
        cantidad: 1,
        precioUnitario: producto.precioVenta!,
        subtotal: producto.precioVenta!
      });
    }
    this.calcularTotalVenta();
  }

  actualizarCantidadCarrito(index: number, cambio: number): void {
    const item = this.carrito[index];
    const nuevaCantidad = item.cantidad + cambio;
    
    if (nuevaCantidad > 0) {
      // Necesitamos buscar el stock real
      const prodOriginal = this.productosTodos.find(p => p.id === item.producto.id);
      if (prodOriginal && nuevaCantidad > prodOriginal.stock!) {
        Swal.fire('Atención', 'Stock máximo alcanzado', 'warning');
        return;
      }
      
      item.cantidad = nuevaCantidad;
      item.subtotal = item.cantidad * item.precioUnitario;
      this.calcularTotalVenta();
    } else if (nuevaCantidad === 0) {
      this.quitarDelCarrito(index);
    }
  }

  quitarDelCarrito(index: number): void {
    this.carrito.splice(index, 1);
    this.calcularTotalVenta();
  }

  calcularTotalVenta(): void {
    this.totalVenta = this.carrito.reduce((sum, item) => sum + item.subtotal, 0);
  }

  procesarVenta(): void {
    if (this.carrito.length === 0) return;

    this.ventaNueva.detalles = this.carrito.map(item => ({
      producto: { id: item.producto.id }, // Solo enviamos el ID al backend
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      subtotal: item.subtotal
    }));
    
    this.ventaNueva.total = this.totalVenta;
    
    if (!this.ventaNueva.clienteNombre || this.ventaNueva.clienteNombre.trim() === '') {
      this.ventaNueva.clienteNombre = 'Cliente General';
    }

    this.procesandoVenta = true;
    this.ventaService.registrarVenta(this.ventaNueva).subscribe({
      next: (ventaConfirmada) => {
        Swal.fire('Venta Exitosa', `Se procesó la venta por S/. ${ventaConfirmada.total?.toFixed(2)}`, 'success');
        this.procesandoVenta = false;
        
        // Limpiar carrito
        this.carrito = [];
        this.ventaNueva = { detalles: [], clienteNombre: '' };
        this.totalVenta = 0;
        
        // Recargar stock de productos
        this.cargarProductos();
      },
      error: (err) => {
        console.error(err);
        this.procesandoVenta = false;
        Swal.fire('Error', 'Hubo un error al registrar la venta.', 'error');
      }
    });
  }

  // --- LÓGICA COBROS PENDIENTES ---
  parseDetalles(detalleJson: string): any[] {
    try {
      return JSON.parse(detalleJson);
    } catch {
      return [];
    }
  }

  pagarCobro(cobro: CobroConsulta): void {
    if (!cobro.id) return;
    
    Swal.fire({
      title: '¿Confirmar Pago?',
      text: `Se procesará el pago por S/. ${cobro.total.toFixed(2)} y se descontará el stock de los productos.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, Pagar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cobroService.pagarCobro(cobro.id!).subscribe({
          next: () => {
            Swal.fire('Pagado', 'El cobro ha sido procesado exitosamente.', 'success');
            
            // Open the PDF comprobante in a new tab
            const url = `http://localhost:8080/api/cobros/${cobro.id}/comprobante/pdf`;
            window.open(url, '_blank');
            
            this.cargarPendientes();
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'Hubo un error al procesar el pago.', 'error');
          }
        });
      }
    });
  }
}
