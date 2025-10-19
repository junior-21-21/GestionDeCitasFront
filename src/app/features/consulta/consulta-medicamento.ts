import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

import { ConsultaMedicamentoService } from '../../services/consulta-medicamento.service';
import { MedicamentoService } from '../../services/medicamento.service';
import { ConsultaMedicamentoDTO, ConsultaMedicamentoResponse } from '../../models/consulta.model';
import { Medicamento } from '../../models/medicamento.model';

@Component({
  selector: 'app-consulta-medicamento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './consulta-medicamento.html',
  styleUrls: ['./consulta-medicamento.scss']
})
export class ConsultaMedicamentoComponent implements OnInit {
  dto: ConsultaMedicamentoDTO = {
    consultaId: 0,
    medicamentoId: 0,
    cantidad: 1,
  };

  medicamentos: Medicamento[] = [];
  filtro: string = '';

  medicamentosAsociados: ConsultaMedicamentoResponse[] = [];

  constructor(
    private servicio: ConsultaMedicamentoService,
    private medicamentoService: MedicamentoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.dto.consultaId = +id;

    // Primero cargar medicamentos, luego asociados para asegurar que medicamentos ya están disponibles
    this.medicamentoService.listar().subscribe({
      next: (data) => {
        this.medicamentos = data;
        // Inicializar cantidadAsociar para cada medicamento (evita errores de undefined)
        this.medicamentos.forEach(m => (m as any).cantidadAsociar = 1);

        // Cargar los medicamentos ya asociados luego de tener la lista completa
        this.cargarMedicamentosAsociados();
      },
      error: () => Swal.fire('Error', 'No se pudo cargar los medicamentos', 'error'),
    });
  }

  cargarMedicamentosAsociados(): void {
    this.servicio.listarMedicamentosPorConsulta(this.dto.consultaId).subscribe({
      next: (data) => this.medicamentosAsociados = data,
      error: () => Swal.fire('Error', 'No se pudieron cargar los medicamentos recetados', 'error'),
    });
  }

  filtrar(): void {
    this.filtro = this.filtro.trim();
  }

  get medicamentosFiltrados(): Medicamento[] {
    const f = this.filtro.toLowerCase().trim();
    if (!f) return this.medicamentos;
    return this.medicamentos.filter(m =>
      m.nombre.toLowerCase().includes(f) || m.id.toString().includes(f)
    );
  }

  // Método para buscar medicamento por id y mostrar nombre en tabla de asociados
  getMedicamento(id: number): Medicamento | undefined {
    return this.medicamentos.find(m => m.id === id);
  }

  asociarMedicamento(med: Medicamento): void {
    const cantidadAsociar = (med as any).cantidadAsociar;
    if (!cantidadAsociar || cantidadAsociar < 1) {
      Swal.fire('Advertencia', 'Ingrese una cantidad válida', 'warning');
      return;
    }
    if (cantidadAsociar > med.stock) {
      Swal.fire('Advertencia', `Stock insuficiente. Solo hay ${med.stock}`, 'warning');
      return;
    }

    const dto: ConsultaMedicamentoDTO = {
      consultaId: this.dto.consultaId,
      medicamentoId: med.id,
      cantidad: cantidadAsociar,
    };

    this.servicio.registrar(dto).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Medicamento asociado correctamente', 'success');
        // Actualizar stock local
        med.stock -= cantidadAsociar;
        // Reset cantidad
        (med as any).cantidadAsociar = 1;
        // Recargar medicamentos asociados
        this.cargarMedicamentosAsociados();
      },
      error: (err) => Swal.fire('Error', err.error?.mensaje || 'Error al asociar medicamento', 'error'),
    });
  }
}
