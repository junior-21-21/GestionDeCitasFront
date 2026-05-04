// paciente.model.ts (renamed from mascota.model.ts)

export interface Paciente {
  codigoPaciente?: string;
  nombre: string;
  especie?: string;
  raza?: string;
  edad?: number;
  peso?: number;
  clienteDni?: string;
}

// DTO para crear o editar un paciente
export interface PacienteDTO {
  nombre: string;
  especie?: string;
  raza?: string;
  edad?: number;
  peso?: number;
  clienteDni: string;
}

// Respuesta del backend
export interface PacienteResponseDTO {
  codigoPaciente: string;
  nombre: string;
  especie?: string;
  raza?: string;
  edad?: number;
  peso?: number;
  clienteDni: string;
  clienteNombreCompleto?: string;
}
