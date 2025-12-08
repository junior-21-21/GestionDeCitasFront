export interface CitaDTO {
  fecha: string; // en formato ISO: "YYYY-MM-DD"
  hora: string;  // en formato "HH:mm"
  motivo: string;
  mascotaId: number;
  veterinarioId: number;
  duracionMinutos?: number;
}
