export interface VeterinarioDTO {
  nombres: string;
  dni: string;
  celular: string;
  correo: string;
  especialidadId: number;
}

export interface VeterinarioResponseDTO {
  dni: string;
  nombres: string;
  celular: string;
  correo: string;
  fotoUrl: string;
  tituloUrl: string;
  especialidad: string;
}
