export interface CitaResponseDTO {
  codigoCita: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
  nombrePaciente: string;
  nombreVeterinario: string;
  pacienteCodigo?: string;
  veterinarioDni?: string;
  duracionMinutos?: number;
  codigoConsulta?: string;
}
