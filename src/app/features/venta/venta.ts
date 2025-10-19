import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../services/venta.service';
import { ClienteService } from '../../services/cliente.service';
import { MedicamentoService } from '../../services/medicamento.service';
import { Cliente } from '../../models/cliente.model';
import { Medicamento } from '../../models/medicamento.model';
import { VentaDTO, VentaResponseDTO } from '../../models/venta.model';

import Swal from 'sweetalert2';


@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './venta.html',
  styleUrls: ['./venta.scss']
})
export class VentaComponent implements OnInit {
  ventas: VentaResponseDTO[] = [];
  clientes: Cliente[] = [];
  medicamentos: Medicamento[] = [];
  busquedaDni: string = '';

  ventaNueva: VentaDTO = {
    clienteId: 0,
    detalles: []
  };

  constructor(
    private ventaService: VentaService,
    private clienteService: ClienteService,
    private medicamentoService: MedicamentoService
  ) {}

  ngOnInit() {
    this.cargarVentas();
    this.cargarClientes();
    this.cargarMedicamentos();
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

  cargarMedicamentos() {
    this.medicamentoService.listar().subscribe(data => {
      // Asegúrate de que cada medicamento tenga 'cantidadAsociar' para el input
      this.medicamentos = data.map(m => ({ ...m, cantidadAsociar: 0 }));
    });
  }

  buscarClientePorDni() {
    if (!this.busquedaDni) {
      alert('Ingrese un DNI');
      return;
    }
    this.clienteService.buscarPorDni(this.busquedaDni).subscribe({
      next: (cliente) => {
        this.ventaNueva.clienteId = cliente.id;
      },
      error: () => alert('Cliente no encontrado')
    });
  }

agregarMedicamento(medicamento: Medicamento) {
  if (!medicamento.cantidadAsociar || medicamento.cantidadAsociar <= 0) {
    Swal.fire('Cantidad inválida', 'Ingrese una cantidad mayor a cero', 'warning');
    return;
  }

  const detalleExistente = this.ventaNueva.detalles.find(
    d => d.medicamentoId === medicamento.id
  );

  if (detalleExistente) {
    detalleExistente.cantidad += medicamento.cantidadAsociar;
  } else {
    this.ventaNueva.detalles.push({
      medicamentoId: medicamento.id,
      cantidad: medicamento.cantidadAsociar
    });
  }

  // Limpia el input de cantidad
  medicamento.cantidadAsociar = 0;

  // Muestra notificación de éxito
  Swal.fire({
    title: 'Agregado',
    text: `Se agregó "${medicamento.nombre}" a la venta`,
    icon: 'success',
    timer: 1500,
    showConfirmButton: false,
    toast: true,
    position: 'top-end'
  });
}

registrarVenta() {
  if (this.ventaNueva.clienteId === 0) {
    Swal.fire('Advertencia', 'Seleccione un cliente', 'warning');
    return;
  }

  if (this.ventaNueva.detalles.length === 0) {
    Swal.fire('Advertencia', 'Agregue al menos un medicamento', 'warning');
    return;
  }

  this.ventaService.registrarVenta(this.ventaNueva).subscribe({
    next: (ventaCreada) => {
      Swal.fire({
        icon: 'success',
        title: 'Venta registrada',
        text: `ID de la venta: ${ventaCreada.id}`,
        confirmButtonText: 'Aceptar'
      });
      this.ventaNueva = { clienteId: 0, detalles: [] };
      this.cargarVentas();
    },
    error: () => {
      Swal.fire('Error', 'Ocurrió un error al registrar la venta', 'error');
    }
  });
}


  descargarRecibo(idVenta: number) {
    this.ventaService.obtenerReciboPDF(idVenta).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo_venta_${idVenta}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Error al descargar recibo')
    });
  }

  getClienteNombreDni(): string {
    const cliente = this.clientes.find(c => c.id === this.ventaNueva.clienteId);
    return cliente ? `${cliente.nombres} (${cliente.dni})` : '';
  }

  getNombreMedicamento(id: number): string {
    const med = this.medicamentos.find(m => m.id === id);
    return med ? med.nombre : 'Desconocido';
  }

  // --- NUEVOS MÉTODOS AÑADIDOS / MODIFICADOS ---

  // Método para obtener el precio de un medicamento dado su ID
  getPrecioMedicamento(medicamentoId: number): number {
    const medicamento = this.medicamentos.find(m => m.id === medicamentoId);
    return medicamento ? medicamento.precio : 0; // Devuelve 0 si no se encuentra
  }

  // Método para calcular el subtotal de un detalle de venta
  getSubtotalDetalle(detalle: any): number {
    const precio = this.getPrecioMedicamento(detalle.medicamentoId);
    return precio * detalle.cantidad;
  }

  getTotalVentaNueva(): number {
    return this.ventaNueva.detalles.reduce((total, d) => {
      return total + this.getSubtotalDetalle(d); // Reutiliza el método del subtotal
    }, 0);
  }
}
