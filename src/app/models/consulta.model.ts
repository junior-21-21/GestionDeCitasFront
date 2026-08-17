export interface ConsultaDTO {
  fecha: string;
  motivo: string;
  peso?: number;
  observaciones?: string;
  diagnostico: string;
  tratamiento: string;
  citaCodigo: string;
}

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
}

export interface Consulta {
  codigoConsulta: string;
  fecha: string;
  motivo: string;
  peso?: number;
  observaciones?: string;
  diagnostico: string;
  tratamiento: string;
  citaCodigo: string;
}

export interface ConsultaProductoDTO {
  codigoConsulta: string;
  codigoBarras: string;
  cantidad: number;
  indicaciones: string;
}

export interface ConsultaProductoResponse {
  codigoConsulta: string;
  codigoBarras: string;
  cantidad: number;
  indicaciones: string;
}
