import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CitaService } from '../../services/cita.service';

import { ConsultaService } from '../../services/consulta.service';
import { VeterinarioService } from '../../services/veterinario.service';
import { MascotaService } from '../../services/mascota.service';

import {
  ConsultaDTO,
  ConsultaResponse,
  ConsultaMedicamentoResponse,
} from '../../models/consulta.model';
import { VeterinarioResponseDTO } from '../../models/veterinario.model';
import { MascotaResponseDTO } from '../../models/mascota.model';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-consultas',
  standalone: true,
  templateUrl: './consulta.html',
  styleUrls: ['./consulta.scss'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class ConsultasComponent implements OnInit {
  consulta: ConsultaDTO = {
    fecha: '',
    motivo: '',
    diagnostico: '',
    tratamiento: '',
    mascotaId: 0,
    veterinarioId: 0,
    citaId: undefined
  };

  veterinarios: VeterinarioResponseDTO[] = [];
  mascotas: MascotaResponseDTO[] = [];
  consultas: ConsultaResponse[] = [];
  medicamentosAsociados: ConsultaMedicamentoResponse[] = [];

  medicamentosVisible = false; // controla si el panel de medicamentos se muestra

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor(
    private consultaService: ConsultaService,
    private veterinarioService: VeterinarioService,
    private mascotaService: MascotaService,
    private route: ActivatedRoute,
    private citaService: CitaService
  ) {}

  ngOnInit(): void {
    this.cargarVeterinarios();
    this.cargarMascotas();
    this.cargarConsultas();

    // Check for citaId param
    this.route.queryParams.subscribe(params => {
      const citaId = params['citaId'];
      if (citaId) {
        this.cargarDatosCita(citaId);
      }
    });
  }

  cargarDatosCita(id: number): void {
     this.citaService.obtenerPorId(id).subscribe({
       next: (cita) => {
         this.consulta.mascotaId = cita.mascotaId;
         this.consulta.veterinarioId = cita.veterinarioId;
         this.consulta.motivo = cita.motivo;
         this.consulta.fecha = new Date().toISOString().split('T')[0]; // Fecha actual para la consulta
         this.consulta.citaId = id; // Asociar ID de cita (asegurar que DTO lo tenga)
         
         Swal.fire({
            title: 'Atendiendo Cita',
            text: `Datos cargados para la cita #${id}`,
            icon: 'info',
            timer: 2000,
            showConfirmButton: false
         });
       },
       error: () => Swal.fire('Error', 'No se pudo cargar la información de la cita', 'error')
     });
  }

  cargarVeterinarios(): void {
    this.veterinarioService.listar().subscribe({
      next: (data) => (this.veterinarios = data),
      error: () =>
        Swal.fire('Error', 'No se pudo cargar veterinarios', 'error'),
    });
  }

  cargarMascotas(): void {
    this.mascotaService.listarTodas().subscribe({
      next: (data) => (this.mascotas = data),
      error: () => Swal.fire('Error', 'No se pudo cargar mascotas', 'error'),
    });
  }

  dniBusqueda: string = '';

  cargarConsultas(): void {
    this.consultaService.listarConsultas().subscribe({
      next: (data) => {
        this.consultas = data;
        this.currentPage = 1; // reiniciar a página 1 al recargar
      },
      error: () => Swal.fire('Error', 'No se pudo listar consultas', 'error'),
    });
  }

  buscarPorDni(): void {
    if (!this.dniBusqueda.trim()) {
      Swal.fire('Atención', 'Ingrese un DNI para buscar', 'warning');
      return;
    }

    this.consultaService.buscarPorDni(this.dniBusqueda).subscribe({
      next: (data) => {
        this.consultas = data;
        this.currentPage = 1;
        if (data.length === 0) {
          Swal.fire('Información', 'No se encontraron consultas para este DNI', 'info');
        }
      },
      error: () => Swal.fire('Error', 'No se pudo realizar la búsqueda', 'error'),
    });
  }

  limpiarBusqueda(): void {
    this.dniBusqueda = '';
    this.cargarConsultas();
  }

  registrar(): void {
    this.consultaService.registrarConsulta(this.consulta).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Consulta registrada correctamente', 'success');
        this.resetFormulario();
        this.cargarConsultas();
      },
      error: (err) => {
        Swal.fire(
          'Error',
          err.error?.mensaje || 'No se pudo registrar la consulta',
          'error'
        );
      },
    });
  }

  resetFormulario(): void {
    this.consulta = {
      fecha: '',
      motivo: '',
      diagnostico: '',
      tratamiento: '',
      mascotaId: 0,
      veterinarioId: 0,
    };
  }

  abrirMedicamentosPanel(consultaId: number): void {
    this.consultaService.obtenerMedicamentosPorConsulta(consultaId).subscribe({
      next: (data) => {
        this.medicamentosAsociados = data;
        this.medicamentosVisible = true; // mostrar el panel
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los medicamentos', 'error');
        this.medicamentosAsociados = [];
        this.medicamentosVisible = true;
      },
    });
  }

  get totalPages(): number {
    return Math.ceil(this.consultas.length / this.itemsPerPage);
  }

  get consultasPaginadas(): ConsultaResponse[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.consultas.slice(start, start + this.itemsPerPage);
  }

  irPagina(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  cerrarMedicamentosPanel(): void {
    this.medicamentosVisible = false;
    this.medicamentosAsociados = [];
  }
}
