export interface MovimientoInventarioDTO {
  id?: number;
  productoCodigoBarras: string;
  loteId?: number;
  usuarioId: number;
  tipoMovimiento: string;
  cantidad: number;
  fechaHora?: string;
  motivoAjuste?: string;
  referenciaId?: number;
}

export interface MovimientoInventarioResponseDTO {
  id: number;
  tipoMovimiento: string;
  cantidad: number;
  fechaHora: string;
  motivoAjuste?: string;
  referenciaId?: number;
  producto: {
    codigoBarras: string;
    nombre: string;
    isControlado: boolean;
  };
  lote?: {
    id: number;
    numeroLote: string;
  };
  usuario: {
    id: number;
    nombres: string;
    apellidos: string;
  };
}
