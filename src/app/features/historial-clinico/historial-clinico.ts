import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsultaService } from '../../services/consulta.service';
import { MascotaService } from '../../services/mascota.service';
import { ConsultaResponse } from '../../models/consulta-response.model';
import { PacienteResponseDTO } from '../../models/mascota.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-historial-clinico',
  standalone: true,
  templateUrl: './historial-clinico.html',
  styleUrls: ['./historial-clinico.scss'],
  imports: [CommonModule, FormsModule],
})
export class HistorialClinicoComponent {
  codigoBusqueda: string = '';
  consultas: ConsultaResponse[] = [];
  buscado: boolean = false;
  nombrePaciente: string = '';
  mascotaInfo: PacienteResponseDTO | null = null;

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor(
    private consultaService: ConsultaService,
    private mascotaService: MascotaService
  ) {}

  ngOnInit(): void {
    this.cargarConsultasDeHoy();
  }

  cargarConsultasDeHoy(): void {
    this.consultaService.listarConsultasHoy().subscribe({
      next: (data) => {
        this.consultas = data;
        this.buscado = false;
        this.nombrePaciente = '';
        this.mascotaInfo = null;
        this.currentPage = 1;
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar las consultas de hoy', 'error');
      }
    });
  }

  buscar(): void {
    const codigo = this.codigoBusqueda.trim();
    if (!codigo) {
      Swal.fire('Atención', 'Ingrese el código de la mascota', 'warning');
      return;
    }

    // Primero buscar datos de la mascota
    this.mascotaService.buscarPorCodigo(codigo).subscribe({
      next: (mascota) => {
        this.mascotaInfo = mascota;
        // Luego buscar el historial de consultas
        this.consultaService.obtenerHistorialPorPaciente(codigo).subscribe({
          next: (data) => {
            this.consultas = data;
            this.buscado = true;
            this.currentPage = 1;
            this.nombrePaciente = mascota.nombre;
            if (data.length === 0) {
              Swal.fire('Información', `${mascota.nombre} no tiene consultas registradas aún`, 'info');
            }
          },
          error: () => {
            Swal.fire('Error', 'No se pudo buscar el historial', 'error');
            this.consultas = [];
            this.buscado = true;
          },
        });
      },
      error: () => {
        Swal.fire('Error', 'No se encontró una mascota con ese código', 'error');
        this.mascotaInfo = null;
        this.consultas = [];
        this.buscado = true;
      }
    });
  }

  limpiar(): void {
    this.codigoBusqueda = '';
    this.mascotaInfo = null;
    this.cargarConsultasDeHoy();
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
}
