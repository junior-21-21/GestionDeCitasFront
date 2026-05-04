export interface ProductoDTO {
  codigoBarras: string;
  nombre: string;
  descripcion: string;
  precioCompra: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  tipoInventario: string; // 'PETSHOP', 'MEDICAMENTO', 'SERVICIO'
  isControlado?: boolean;
  costoPromedio?: number;
  categoriaId: number;
  cantidadAsociar?: number;
}
