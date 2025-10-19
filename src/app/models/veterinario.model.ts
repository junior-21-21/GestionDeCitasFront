export interface VeterinarioDTO {
  nombres: string;
  cmp: string;
  especialidadId: number;
}

export interface VeterinarioResponseDTO {
  id: number;
  nombres: string;
  cmp: string;
  especialidad: string;
}
