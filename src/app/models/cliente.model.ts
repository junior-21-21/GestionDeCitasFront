export interface Cliente {
  id?: number;
  nombres: string;
  correo?: string;
  dni: string;
}

export interface ClienteResponseDTO {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
}
