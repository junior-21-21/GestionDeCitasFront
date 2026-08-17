export interface Cliente {
  nombres: string;
  apellidos: string;
  dni: string;
  tipoDocumento?: string; // DNI, RUC
  razonSocial?: string;
  telefono?: string;
  calle?: string;
  numero?: string;
  distrito?: string;
  provincia?: string;
  telefonos?: { numero: string; tipo: string }[];
  email?: string;
  puntosFidelidad?: number;
}
export interface ClienteResponseDTO {
  nombres: string;
  apellidos: string;
  dni: string;
}
