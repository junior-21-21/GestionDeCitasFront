import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { CategoriaProductoService } from '../../services/categoria-producto.service';
import { ProductoDTO } from '../../models/producto.model';
import { LoteDTO } from '../../models/lote.model';
import { CategoriaProductoDTO } from '../../models/categoria-producto.model';
import { InventarioService } from '../../services/inventario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit {
  productos: ProductoDTO[] = [];
  categorias: CategoriaProductoDTO[] = [];
  nuevo: ProductoDTO = { codigoBarras: '', nombre: '', descripcion: '', precioCompra: 0, precioVenta: 0, stockActual: 0, stockMinimo: 0, tipoInventario: 'PETSHOP', categoriaId: 0, isControlado: false };
  editando: ProductoDTO | null = null;
  productoEntrada: ProductoDTO | null = null;
  nuevoLote: LoteDTO = { productoCodigoBarras: '', numeroLote: '', fechaVencimiento: '', stockInicial: 0, stockActual: 0, costoUnitario: 0 };
  
  productoAjuste: ProductoDTO | null = null;
  nuevoAjuste = {
    cantidad: 0,
    motivo: '',
    tipoMovimiento: 'AJUSTE_MERMA',
    loteId: null as number | null
  };
  lotesDisponiblesAjuste: LoteDTO[] = [];
  
  // Tab control
  filtroTipo: string = 'PETSHOP'; // 'PETSHOP', 'MEDICAMENTO', 'SERVICIO'

  // Paginación
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaProductoService,
    private inventarioService: InventarioService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProductos();
  }

  cargarCategorias() {
    this.categoriaService.listarTodos().subscribe(cats => {
      this.categorias = cats;
      if (this.categorias.length > 0 && this.nuevo.categoriaId === 0) {
        this.nuevo.categoriaId = this.categorias[0].id!;
      }
    });
  }

  cargarProductos() {
    this.productoService.listarTodos().subscribe(prods => {
      this.productos = prods;
      this.totalPages = Math.ceil(this.productos.length / this.pageSize);
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages || 1;
      }
    });
  }

  getCategoriaNombre(id: number): string {
    const cat = this.categorias.find(c => c.id === id);
    return cat ? cat.nombre : 'Desconocida';
  }

  get productosFiltrados(): ProductoDTO[] {
    return this.productos.filter(p => p.tipoInventario === this.filtroTipo);
  }

  get productosPaginados(): ProductoDTO[] {
    const list = this.productosFiltrados;
    this.totalPages = Math.ceil(list.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }
  
  cambiarFiltro(tipo: string) {
    this.filtroTipo = tipo;
    this.currentPage = 1;
  }

  irPagina(n: number) {
    if (n >= 1 && n <= this.totalPages) {
      this.currentPage = n;
    }
  }

  registrar() {
    this.productoService.crear(this.nuevo).subscribe({
      next: () => {
        this.nuevo = { codigoBarras: '', nombre: '', descripcion: '', precioCompra: 0, precioVenta: 0, stockActual: 0, stockMinimo: 0, tipoInventario: this.filtroTipo, categoriaId: this.categorias.length > 0 ? this.categorias[0].id! : 0, isControlado: false };
        this.cargarProductos();
        Swal.fire({
          icon: 'success',
          title: 'Registrado',
          text: 'El producto fue registrado exitosamente.',
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

  seleccionarParaEditar(prod: ProductoDTO) {
    this.editando = { ...prod };
  }

  actualizar() {
    if (this.editando && this.editando.codigoBarras) {
      this.productoService.actualizar(this.editando.codigoBarras, this.editando).subscribe({
        next: () => {
          this.editando = null;
          this.cargarProductos();
          Swal.fire({
            icon: 'success',
            title: 'Actualizado',
            text: 'El producto fue actualizado correctamente.',
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

  eliminar(codigoBarras: string) {
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
        this.productoService.eliminar(codigoBarras).subscribe({
          next: () => {
            this.cargarProductos();
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El producto fue eliminado correctamente.',
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
  // Modal/Form logic for Lote Entry
  seleccionarParaEntrada(prod: ProductoDTO) {
    this.productoEntrada = prod;
    this.nuevoLote = {
      productoCodigoBarras: prod.codigoBarras,
      numeroLote: '',
      fechaVencimiento: '',
      stockInicial: 0,
      stockActual: 0,
      costoUnitario: prod.precioCompra || 0
    };
  }

  cancelarEntrada() {
    this.productoEntrada = null;
  }

  registrarEntrada() {
    if (!this.nuevoLote.numeroLote || !this.nuevoLote.fechaVencimiento || this.nuevoLote.stockInicial <= 0) {
      Swal.fire('Atención', 'Debe completar el número de lote, fecha de vencimiento y cantidad.', 'warning');
      return;
    }

    let usuarioId = 1; 
    const authUserStr = localStorage.getItem('authUser');
    if (authUserStr) {
      try {
        const user = JSON.parse(authUserStr);
        if (user && user.id) usuarioId = user.id;
      } catch(e) {}
    }

    this.inventarioService.registrarEntrada(usuarioId, this.productoEntrada!.codigoBarras, this.nuevoLote).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Entrada Registrada',
          text: 'El lote se añadió al inventario exitosamente.',
          timer: 1500,
          showConfirmButton: false
        });
        this.productoEntrada = null;
        this.cargarProductos();
      },
      error: err => {
        Swal.fire('Error', err.error || 'No se pudo registrar la entrada de lote.', 'error');
      }
    });
  }

  // Lógica de Ajuste de Inventario 
  seleccionarParaAjuste(prod: ProductoDTO) {
    this.productoAjuste = prod;
    this.nuevoAjuste = {
      cantidad: 0,
      motivo: '',
      tipoMovimiento: 'AJUSTE_MERMA',
      loteId: null
    };

    if (prod.tipoInventario === 'MEDICAMENTO') {
      this.inventarioService.obtenerLotesDisponibles(prod.codigoBarras).subscribe(lotes => {
        this.lotesDisponiblesAjuste = lotes;
      });
    } else {
      this.lotesDisponiblesAjuste = [];
    }
  }

  cancelarAjuste() {
    this.productoAjuste = null;
  }

  registrarAjuste() {
    if (this.nuevoAjuste.cantidad === 0 || !this.nuevoAjuste.motivo) {
       Swal.fire('Atención', 'Debe ingresar cantidad (puede ser negativa) y motivo', 'warning');
       return;
    }
    
    if (this.productoAjuste!.tipoInventario === 'MEDICAMENTO' && !this.nuevoAjuste.loteId) {
       Swal.fire('Atención', 'Debe seleccionar un lote para ajustar medicamentos', 'warning');
       return;
    }

    let usuarioId = 1; 
    const authUserStr = localStorage.getItem('authUser');
    if (authUserStr) {
      try {
        const user = JSON.parse(authUserStr);
        if (user && user.id) usuarioId = user.id;
      } catch(e) {}
    }

    const { cantidad, motivo, tipoMovimiento, loteId } = this.nuevoAjuste;
    this.inventarioService.ajustarInventario(usuarioId, this.productoAjuste!.codigoBarras, cantidad, motivo, tipoMovimiento, loteId || undefined).subscribe({
      next: () => {
         Swal.fire('Éxito', 'Ajuste de inventario registrado', 'success');
         this.productoAjuste = null;
         this.cargarProductos();
      },
      error: err => Swal.fire('Error', err.error || 'Ocurrió un error', 'error')
    });
  }
}
