export interface Cliente {
  nombres: string;
  apellidos: string;
  dni: string;
  tipoDocumento?: string; // DNI, RUC
  razonSocial?: string;
  telefono?: string;
  direccion?: string;
  email?: string;
}
export interface ClienteResponseDTO {
  nombres: string;
  apellidos: string;
  dni: string;
}
