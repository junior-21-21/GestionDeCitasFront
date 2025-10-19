export interface MedicamentoDTO {
  nombre: string;
  descripcion: string;
  stock: number;
  precio: number;
}

export interface Medicamento {
  id: number;
  nombre: string;
  descripcion: string;
  stock: number;
  precio: number;

  // Propiedad local para manejar cantidad a asociar
  cantidadAsociar?: number;
}

