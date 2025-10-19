export interface ConsultaDTO {
  fecha: string;
  motivo: string;
  diagnostico: string;
  tratamiento: string;
  mascotaId: number;
  veterinarioId: number;
}

export interface ConsultaResponse {
  id: number;
  fecha: string;
  motivo: string;
  diagnostico: string;
  tratamiento: string;
  nombreMascota: string;
  nombreVeterinario: string;
}

export interface Consulta {
  id: number;
  fecha: string;
  motivo: string;
  diagnostico: string;
  tratamiento: string;
  mascotaId: number;
  veterinarioId: number;
}

export interface ConsultaMedicamentoDTO {
  consultaId: number;
  medicamentoId: number;
  cantidad: number;
}

export interface ConsultaMedicamentoResponse {
  consultaId: number;
  medicamentoId: number;
  cantidad: number;
  nombreMedicamento: string;
  descripcionMedicamento: string;
  precioMedicamento: number;
}
