export interface UsuarioDTO {
  id?: number;
  email: string;
  password?: string;
  nombres: string;
  apellidos?: string;
  fotoUrl?: string;
  rol?: string;
  cuentaBloqueada?: boolean;
  habilitada?: boolean;
}
