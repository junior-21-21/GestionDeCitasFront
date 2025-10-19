// mascota.model.ts

export interface Mascota {
  id?: number;
  nombre: string;
  especie?: string;
  raza?: string;
  edad?: number;
  clienteId?: number; // opcional si no siempre está presente
}

// DTO para crear o editar una mascota
export interface MascotaDTO {
  nombre: string;
  especie?: string;
  raza?: string;
  edad?: number;
  clienteId: number;
}

// Respuesta del backend
export interface MascotaResponseDTO {
  id: number;
  nombre: string;
  especie?: string;
  raza?: string;
  edad?: number;
  clienteId: number;
}
