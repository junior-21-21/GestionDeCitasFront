import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KardexService, KardexDTO } from '../../../services/kardex.service';
import { ProductoService } from '../../../services/producto.service';
import { ProductoDTO } from '../../../models/producto.model';

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kardex.html',
  styleUrls: ['./kardex.scss']
})
export class KardexComponent implements OnInit {
  productos: ProductoDTO[] = [];
  historialKardex: KardexDTO[] = [];
  productoSeleccionadoId: number | null = null;
  cargando = false;

  constructor(
    private kardexService: KardexService,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.listarTodos().subscribe({
      next: (data) => this.productos = data,
      error: (err) => console.error(err)
    });
  }

  onProductoChange() {
    if (this.productoSeleccionadoId) {
      this.cargando = true;
      this.kardexService.obtenerHistorialPorProducto(Number(this.productoSeleccionadoId)).subscribe({
        next: (data) => {
          this.historialKardex = data;
          this.cargando = false;
        },
        error: (err) => {
          console.error(err);
          this.cargando = false;
        }
      });
    } else {
      this.historialKardex = [];
    }
  }

  getClaseOperacion(tipo: string): string {
    switch (tipo) {
      case 'INGRESO': return 'badge bg-success';
      case 'VENTA': return 'badge bg-primary';
      case 'CONSUMO_INTERNO': return 'badge bg-warning text-dark';
      case 'AJUSTE': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }
}
