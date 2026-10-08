export interface ConsultaDTO {
  fecha: string;
  motivo: string;
  peso?: number;
  observaciones?: string;
  diagnostico: string;
  tratamiento: string;
  citaCodigo: string;
  estadoIngreso?: string;
  estadoSalida?: string;
  requiereInternamiento?: boolean;
  motivoInternamiento?: string;
  nivelUrgencia?: string;
  temperatura?: number;
  frecuenciaCardiaca?: number;
  frecuenciaRespiratoria?: number;
  tiempoLlenadoCapilar?: number;
  sistemasAnormales?: string;
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
  estadoIngreso?: string;
  estadoSalida?: string;
  requiereInternamiento?: boolean;
  motivoInternamiento?: string;
  nivelUrgencia?: string;
  temperatura?: number;
  frecuenciaCardiaca?: number;
  frecuenciaRespiratoria?: number;
  tiempoLlenadoCapilar?: number;
  sistemasAnormales?: string;
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
  estadoIngreso?: string;
  estadoSalida?: string;
  requiereInternamiento?: boolean;
  motivoInternamiento?: string;
  nivelUrgencia?: string;
  temperatura?: number;
  frecuenciaCardiaca?: number;
  frecuenciaRespiratoria?: number;
  tiempoLlenadoCapilar?: number;
  sistemasAnormales?: string;
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
