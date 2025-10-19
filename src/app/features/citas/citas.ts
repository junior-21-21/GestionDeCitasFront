import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../services/cita.service';
import { MascotaService } from '../../services/mascota.service';
import { VeterinarioService } from '../../services/veterinario.service';
import { CitaDTO } from '../../models/cita-dto.model';
import { CitaResponseDTO } from '../../models/cita-response.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './citas.html',
  styleUrls: ['./citas.scss']
})
export class CitasComponent implements OnInit {
  citas: CitaResponseDTO[] = [];
  mascotas: any[] = [];
  veterinarios: any[] = [];

  nuevaCita: CitaDTO = {
    fecha: '',
    hora: '',
    motivo: '',
    mascotaId: 0,
    veterinarioId: 0
  };

  idEditando: number | null = null;
  editando: boolean = false;

  constructor(
    private citaService: CitaService,
    private mascotaService: MascotaService,
    private veterinarioService: VeterinarioService
  ) {}

  ngOnInit(): void {
    this.cargarCitas();
    this.cargarMascotas();
    this.cargarVeterinarios();
  }

  cargarCitas(): void {
    this.citaService.listarResumen().subscribe({
      next: (data: CitaResponseDTO[]) => this.citas = data,
      error: () => Swal.fire('Error', '❌ Error al cargar citas', 'error')
    });
  }

  cargarMascotas(): void {
    this.mascotaService.listar().subscribe({
      next: (data: any[]) => this.mascotas = data,
      error: () => Swal.fire('Error', '❌ Error al cargar mascotas', 'error')
    });
  }

  cargarVeterinarios(): void {
    this.veterinarioService.listar().subscribe({
      next: (data: any[]) => this.veterinarios = data,
      error: () => Swal.fire('Error', '❌ Error al cargar veterinarios', 'error')
    });
  }

  registrar(): void {
    if (this.editando && this.idEditando !== null) {
      this.citaService.editarCita(this.idEditando, this.nuevaCita).subscribe({
        next: () => {
          Swal.fire('Actualizado', '✅ Cita actualizada correctamente', 'success');
          this.cargarCitas();
          this.cancelarEdicion();
        },
        error: () => Swal.fire('Error', '❌ No se pudo actualizar la cita', 'error')
      });
    } else {
      this.citaService.registrarCita(this.nuevaCita).subscribe({
        next: () => {
          Swal.fire('Registrado', '✅ Cita registrada exitosamente', 'success');
          this.cargarCitas();
          this.resetFormulario();
        },
        error: () => Swal.fire('Error', '❌ No se pudo registrar la cita', 'error')
      });
    }
  }

  prepararEdicion(cita: CitaResponseDTO): void {
    this.idEditando = cita.id;
    this.editando = true;
    this.nuevaCita = {
      fecha: cita.fecha,
      hora: cita.hora,
      motivo: cita.motivo,
      mascotaId: cita.mascotaId ?? 0,
      veterinarioId: cita.veterinarioId ?? 0
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cambiarEstado(id: number, estado: string): void {
    this.citaService.cambiarEstado(id, estado).subscribe({
      next: () => {
        Swal.fire('Actualizado', '✅ Estado de la cita actualizado', 'success');
        this.cargarCitas();
      },
      error: () => Swal.fire('Error', '❌ Error al cambiar estado', 'error')
    });
  }

  cancelarEdicion(): void {
    this.idEditando = null;
    this.editando = false;
    this.resetFormulario();
  }

  resetFormulario(): void {
    this.nuevaCita = {
      fecha: '',
      hora: '',
      motivo: '',
      mascotaId: 0,
      veterinarioId: 0
    };
  }
}
