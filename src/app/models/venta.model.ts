export interface DetalleVentaDTO {
  medicamentoId: number;
  cantidad: number;
}

export interface VentaDTO {
  clienteId: number;
  detalles: DetalleVentaDTO[];
}

export interface VentaResponseDTO {
  id: number;
  fecha: string;
  total: number;
  cliente: {
    id: number;
    nombres: string;
    apellidos: string;
  };
}
