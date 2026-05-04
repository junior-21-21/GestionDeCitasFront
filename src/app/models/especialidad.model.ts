export interface Especialidad {
  id?: number;
  nombre: string;
  veterinarios?: Veterinario[];
}

export interface Veterinario {
  id: number;
  nombres: string;
  cmp: string;
}
