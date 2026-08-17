import { Categoria } from './categoria.interface';

export enum TipoProducto {
  INSUMO_MEDICO = 'INSUMO_MEDICO',
  VENTA_PUBLICO = 'VENTA_PUBLICO',
  SERVICIO = 'SERVICIO'
}

export interface Producto {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  tipo: TipoProducto | string;
  categoria?: Categoria;
}
