export interface ProductoDTO {
  id?: number;
  codigo?: string;
  codigoBarras: string;
  nombre: string;
  descripcion?: string;
  precioCompra?: number;
  precioVenta?: number;
  stock?: number;
  stockActual: number;
  stockMinimo?: number;
  activo?: boolean;
  categoria?: any;
  categoriaId?: number;
  tipoInventario: string;
  isControlado?: boolean;
  costoPromedio?: number;
  cantidadAsociar: number;
}
