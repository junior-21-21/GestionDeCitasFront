export interface LoginResponse {
  id: number;
  email: string;
  nombres: string;
  apellidos?: string;
  rol: string;
  token: string;
  fotoUrl?: string;
}
