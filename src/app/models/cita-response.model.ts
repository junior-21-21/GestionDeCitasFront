export interface CitaResponseDTO {
  id: number;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
  mascotaNombre: string;
  veterinarioNombre: string;
  mascotaId?: number;
  veterinarioId?: number;


    nombreMascota?: string;
    nombreVeterinario?: string;
}
