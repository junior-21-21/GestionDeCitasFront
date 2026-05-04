export interface DetalleVentaDTO {
  codigoBarras: string;
  cantidad: number;
}

export interface VentaDTO {
  clienteDni: string;
  tipoComprobante: string; // BOLETA, FACTURA
  metodoPago: string; // EFECTIVO, TARJETA, TRANSFERENCIA
  recetaMedica?: string;
  detalles: DetalleVentaDTO[];
}

export interface VentaResponseDTO {
  codigoVenta: string;
  tipoComprobante: string;
  serie: string;
  correlativo: string;
  fecha: string;
  subtotal: number;
  igv: number;
  total: number;
  cliente: {
    dni: string;
    nombres: string;
    apellidos: string;
  };
  recetaMedica?: string;
}
