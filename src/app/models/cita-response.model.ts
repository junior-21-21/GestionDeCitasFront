export interface CitaResponseDTO {
  id: number;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
  nombreMascota: string;
  nombreVeterinario: string;
  mascotaId?: number;
  veterinarioId?: number;
  duracionMinutos?: number;
}
