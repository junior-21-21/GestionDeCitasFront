export interface LoteDTO {
  id?: number;
  productoCodigoBarras: string;
  numeroLote: string;
  fechaVencimiento: string; // ISO format YYYY-MM-DD
  stockInicial: number;
  stockActual: number;
  costoUnitario: number;
  fechaIngreso?: string;
}
