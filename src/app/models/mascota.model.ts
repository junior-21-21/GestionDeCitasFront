// paciente.model.ts (renamed from mascota.model.ts)

export interface Paciente {
  codigoPaciente?: string;
  nombre: string;
  especie?: string;
  raza?: string;
  razaId?: number;
  especieId?: number;
  fechaNacimiento?: string;
  edadCalculada?: number;
  peso?: number;
  genero?: string;
  clienteDni?: string;
}

// DTO para crear o editar un paciente
export interface PacienteDTO {
  nombre: string;
  razaId: number;
  fechaNacimiento: string;
  peso?: number;
  genero?: string;
  clienteDni: string;
  fotoUrl?: string;
}

// Respuesta del backend
export interface PacienteResponseDTO {
  codigoPaciente: string;
  nombre: string;
  especie?: string;
  raza?: string;
  especieId?: number;
  razaId?: number;
  fechaNacimiento?: string;
  edadCalculada?: number;
  peso?: number;
  genero?: string;
  clienteDni: string;
  clienteNombreCompleto?: string;
  fotoUrl?: string;
}
