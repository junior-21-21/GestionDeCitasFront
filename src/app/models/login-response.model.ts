export interface LoginResponse {
  id: number;
  username: string;
  nombres: string;
  roles: { nombre: string }[];
  token: string;
}
