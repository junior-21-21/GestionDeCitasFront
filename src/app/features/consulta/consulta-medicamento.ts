import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

import { ConsultaProductoService } from '../../services/consulta-producto.service';
import { ProductoService } from '../../services/producto.service';
import { ConsultaProductoDTO, ConsultaProductoResponse } from '../../models/consulta.model';
import { ProductoDTO } from '../../models/producto.model';

@Component({
  selector: 'app-consulta-medicamento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './consulta-medicamento.html',
  styleUrls: ['./consulta-medicamento.scss']
})
export class ConsultaMedicamentoComponent implements OnInit {
  dto: ConsultaProductoDTO = {
    codigoConsulta: '',
    codigoBarras: '',
    cantidad: 1,
    indicaciones: ''
  };

  productos: ProductoDTO[] = [];
  filtro: string = '';

  productosAsociados: ConsultaProductoResponse[] = [];

  constructor(
    private servicio: ConsultaProductoService,
    private productoService: ProductoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.dto.codigoConsulta = id;

    this.productoService.listarTodos().subscribe({
      next: (data) => {
        this.productos = data;
        this.productos.forEach(p => (p as any).cantidadAsociar = 1);
        this.cargarProductosAsociados();
      },
      error: () => Swal.fire('Error', 'No se pudo cargar los productos', 'error'),
    });
  }

  cargarProductosAsociados(): void {
    this.servicio.obtenerProductosPorConsulta(this.dto.codigoConsulta).subscribe({
      next: (data) => this.productosAsociados = data,
      error: () => Swal.fire('Error', 'No se pudieron cargar los productos asociados', 'error'),
    });
  }

  filtrar(): void {
    this.filtro = this.filtro.trim();
  }

  get productosFiltrados(): ProductoDTO[] {
    const f = this.filtro.toLowerCase().trim();
    if (!f) return this.productos;
    return this.productos.filter(p =>
      p.nombre.toLowerCase().includes(f) || (p.codigoBarras && p.codigoBarras.toString().includes(f))
    );
  }

  getProducto(codigoBarras: string): ProductoDTO | undefined {
    return this.productos.find(p => p.codigoBarras === codigoBarras);
  }

  asociarProducto(prod: ProductoDTO): void {
    const cantidadAsociar = (prod as any).cantidadAsociar;
    if (!cantidadAsociar || cantidadAsociar < 1) {
      Swal.fire('Advertencia', 'Ingrese una cantidad válida', 'warning');
      return;
    }
    if (prod.tipoInventario !== 'SERVICIO' && cantidadAsociar > prod.stockActual) {
      Swal.fire('Advertencia', `Stock insuficiente. Solo hay ${prod.stockActual}`, 'warning');
      return;
    }

    const dto: ConsultaProductoDTO = {
      codigoConsulta: this.dto.codigoConsulta,
      codigoBarras: prod.codigoBarras,
      cantidad: cantidadAsociar,
      indicaciones: this.dto.indicaciones || 'Indicaciones generales'
    };

    this.servicio.agregarProducto(dto).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Producto/Servicio asociado correctamente', 'success');
        if (prod.tipoInventario !== 'SERVICIO') {
          prod.stockActual -= cantidadAsociar;
        }
        (prod as any).cantidadAsociar = 1;
        this.dto.indicaciones = '';
        this.cargarProductosAsociados();
      },
      error: (err) => Swal.fire('Error', err.error?.mensaje || 'Error al asociar producto', 'error'),
    });
  }
}
