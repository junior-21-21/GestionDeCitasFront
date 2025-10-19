export interface ConsultaResponse {
  id: number;
  fecha: string;
  motivo: string;
  diagnostico: string;
  tratamiento: string;
  nombreMascota: string;
  nombreVeterinario: string;

  // 🔽 Nueva propiedad: lista de medicamentos asociados
  medicamentos?: MedicamentoAsociado[];
}

export interface MedicamentoAsociado {
  nombreMedicamento: string;
  cantidad: number;
}
