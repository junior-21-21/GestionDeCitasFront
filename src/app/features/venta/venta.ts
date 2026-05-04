import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../services/venta.service';
import { ClienteService } from '../../services/cliente.service';
import { ProductoService } from '../../services/producto.service';
import { Cliente } from '../../models/cliente.model';
import { ProductoDTO } from '../../models/producto.model';
import { VentaDTO, VentaResponseDTO } from '../../models/venta.model';

import Swal from 'sweetalert2';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './venta.html',
  styleUrls: ['./venta.scss']
})
export class VentaComponent implements OnInit {
  ventas: VentaResponseDTO[] = [];
  clientes: Cliente[] = [];
  productos: ProductoDTO[] = [];
  busquedaDni: string = '';

  ventaNueva: VentaDTO = {
    clienteDni: '',
    tipoComprobante: 'BOLETA',
    metodoPago: 'EFECTIVO',
    recetaMedica: '',
    detalles: []
  };
  
  // Barcode scanner input
  codigoBarrasScanner: string = '';

  constructor(
    private ventaService: VentaService,
    private clienteService: ClienteService,
    private productoService: ProductoService
  ) {}

  ngOnInit() {
    this.cargarVentas();
    this.cargarClientes();
    this.cargarProductos();
  }

  cargarVentas() {
    this.ventaService.listarVentas().subscribe(data => {
      this.ventas = data;
    });
  }

  cargarClientes() {
    this.clienteService.listar().subscribe(data => {
      this.clientes = data;
    });
  }

  cargarProductos() {
    this.productoService.listarTodos().subscribe(data => {
      this.productos = data.map(p => ({ ...p, cantidadAsociar: 0 }));
    });
  }

  buscarClientePorDni() {
    if (!this.busquedaDni) {
      alert(this.ventaNueva.tipoComprobante === 'FACTURA' ? 'Ingrese un RUC' : 'Ingrese un DNI');
      return;
    }
    this.clienteService.buscarPorDni(this.busquedaDni).subscribe({
      next: (cliente) => {
        this.ventaNueva.clienteDni = cliente.dni;
      },
      error: () => alert('Cliente no encontrado')
    });
  }

  onEscanearCodigo() {
    if (!this.codigoBarrasScanner) return;
    
    const producto = this.productos.find(p => p.codigoBarras === this.codigoBarrasScanner);
    
    if (producto) {
      // Si el producto existe, añadir automáticamente 1 al carrito
      (producto as any).cantidadAsociar = 1;
      this.agregarProducto(producto);
    } else {
      Swal.fire('No encontrado', `No se encontró producto con código: ${this.codigoBarrasScanner}`, 'warning');
    }
    
    // Limpiar el campo para el siguiente escaneo
    this.codigoBarrasScanner = '';
  }

  agregarProducto(producto: ProductoDTO) {
    if (!(producto as any).cantidadAsociar || (producto as any).cantidadAsociar <= 0) {
      Swal.fire('Cantidad inválida', 'Ingrese una cantidad mayor a cero', 'warning');
      return;
    }

    const detalleExistente = this.ventaNueva.detalles.find(
      d => d.codigoBarras === producto.codigoBarras
    );

    if (detalleExistente) {
      detalleExistente.cantidad += (producto as any).cantidadAsociar;
    } else {
      this.ventaNueva.detalles.push({
        codigoBarras: producto.codigoBarras,
        cantidad: (producto as any).cantidadAsociar
      });
    }

    // Limpia el input de cantidad
    (producto as any).cantidadAsociar = 0;

    // Muestra notificación de éxito
    Swal.fire({
      title: 'Agregado',
      text: `Se agregó "${producto.nombre}" a la venta`,
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }

  registrarVenta() {
    if (this.ventaNueva.clienteDni === '') {
      Swal.fire('Advertencia', 'Seleccione un cliente', 'warning');
      return;
    }

    if (this.ventaNueva.detalles.length === 0) {
      Swal.fire('Advertencia', 'Agregue al menos un producto', 'warning');
      return;
    }

    if (this.requiereReceta && (!this.ventaNueva.recetaMedica || this.ventaNueva.recetaMedica.trim() === '')) {
      Swal.fire('Advertencia', 'Debe ingresar el Nro de Receta Médica para los medicamentos controlados', 'warning');
      return;
    }

    this.ventaService.registrarVenta(this.ventaNueva).subscribe({
      next: (ventaCreada) => {
        Swal.fire({
          icon: 'success',
          title: 'Venta registrada',
          text: `Comprobante ${ventaCreada.serie}-${ventaCreada.correlativo} generado exitosamente.`,
          confirmButtonText: 'Aceptar'
        });
        this.ventaNueva = { clienteDni: '', tipoComprobante: 'BOLETA', metodoPago: 'EFECTIVO', recetaMedica: '', detalles: [] };
        this.busquedaDni = '';
        this.cargarVentas();
      },
      error: () => {
        Swal.fire('Error', 'Ocurrió un error al registrar la venta', 'error');
      }
    });
  }

  descargarRecibo(codigoVenta: string) {
    this.ventaService.obtenerReciboPDF(codigoVenta).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo_venta_${codigoVenta}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Error al descargar recibo')
    });
  }

  getClienteNombreDni(): string {
    const cliente = this.clientes.find(c => c.dni === this.ventaNueva.clienteDni);
    if (!cliente) return '';
    if (this.ventaNueva.tipoComprobante === 'FACTURA' && cliente.razonSocial) {
      return `${cliente.razonSocial} (RUC: ${cliente.dni})`;
    }
    return `${cliente.nombres} ${cliente.apellidos} (DNI: ${cliente.dni})`;
  }

  getNombreProducto(codigoBarras: string): string {
    const prod = this.productos.find(p => p.codigoBarras === codigoBarras);
    return prod ? prod.nombre : 'Desconocido';
  }

  getPrecioProducto(codigoBarras: string): number {
    const prod = this.productos.find(p => p.codigoBarras === codigoBarras);
    return prod ? prod.precioVenta : 0;
  }

  getSubtotalDetalle(detalle: any): number {
    const precio = this.getPrecioProducto(detalle.codigoBarras);
    return precio * detalle.cantidad;
  }

  getTotalVentaNueva(): number {
    return this.ventaNueva.detalles.reduce((total, d) => {
      return total + this.getSubtotalDetalle(d);
    }, 0);
  }

  getSubtotalCalculado(): number {
    return this.getTotalVentaNueva() / 1.18;
  }

  getIgvCalculado(): number {
    return this.getTotalVentaNueva() - this.getSubtotalCalculado();
  }

  get requiereReceta(): boolean {
    return this.ventaNueva.detalles.some(d => {
      const p = this.productos.find(prod => prod.codigoBarras === d.codigoBarras);
      return p ? !!p.isControlado : false;
    });
  }
}
