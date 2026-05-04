export interface ConsultaResponse {
  codigoConsulta: string;
  fecha: string;
  motivo: string;
  peso?: number;
  observaciones?: string;
  diagnostico: string;
  tratamiento: string;
  nombrePaciente: string;
  nombreVeterinario: string;
  productos?: ProductoAsociado[];
}

export interface ProductoAsociado {
  nombreProducto: string;
  cantidad: number;
}
