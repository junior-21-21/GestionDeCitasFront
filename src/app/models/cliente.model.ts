export interface Cliente {
  id?: number;
  nombres: string;
  apellidos: string;  // Nuevo
  dni: string;
  telefono?: string;  // Nuevo
  direccion?: string; // Nuevo
  // Eliminamos 'correo' porque no está en tu tabla
}
export interface ClienteResponseDTO {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
}
