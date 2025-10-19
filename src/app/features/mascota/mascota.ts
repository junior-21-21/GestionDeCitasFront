import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MascotaDTO, MascotaResponseDTO } from '../../models/mascota.model';
import { MascotaService } from '../../services/mascota.service';
import { ClienteService } from '../../services/cliente.service';
import { ClienteResponseDTO } from '../../models/cliente.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registrar-mascota',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mascota.html'
})
export class MascotaComponent implements OnInit {
  dniCliente: string = '';
  clienteEncontrado: ClienteResponseDTO | null = null;

  mascota: MascotaDTO = {
    nombre: '',
    especie: '',
    raza: '',
    edad: 0,
    clienteId: 0
  };

  mascotas: MascotaResponseDTO[] = [];

  // Variables para paginación
  paginaActual = 1;
  itemsPorPagina = 5;

  // Controla si estamos editando y qué mascota editamos
  editando: MascotaResponseDTO | null = null;

  constructor(
    private mascotaService: MascotaService,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    this.cargarMascotas();
  }

  buscarClientePorDni(): void {
    this.clienteService.buscarPorDni(this.dniCliente).subscribe({
      next: (data) => {
        this.clienteEncontrado = data;
        this.mascota.clienteId = data.id;
        Swal.fire('Cliente encontrado', `${data.nombres} ${data.apellidos}`, 'success');
      },
      error: () => {
        this.clienteEncontrado = null;
        this.mascota.clienteId = 0;
        Swal.fire('Error', 'Cliente no encontrado', 'error');
      }
    });
  }

  registrar(): void {
    if (!this.clienteEncontrado) {
      Swal.fire('Advertencia', 'Debe buscar primero un cliente válido por DNI.', 'warning');
      return;
    }

    this.mascotaService.registrar(this.mascota).subscribe({
      next: (nuevaMascota) => {
        Swal.fire('Registrado', 'Mascota registrada correctamente ✅', 'success');
        this.mascotas.unshift(nuevaMascota); // Insertar al inicio
        this.resetFormulario();
        this.paginaActual = 1;
      },
      error: err => {
        console.error(err);
        Swal.fire('Error', `Error al registrar mascota: ${err.error}`, 'error');
      }
    });
  }

  cargarMascotas(): void {
    this.mascotaService.listarTodas().subscribe({
      next: (data) => {
        this.mascotas = data;
        this.paginaActual = 1;
      },
      error: (err) => console.error('Error al cargar mascotas', err)
    });
  }

  cancelarEdicion(): void {
    this.editando = null;
    this.resetFormulario();
    this.clienteEncontrado = null;
  }

  actualizar(): void {
    if (!this.editando) return;

    const dto: MascotaDTO = {
      nombre: this.mascota.nombre,
      especie: this.mascota.especie,
      raza: this.mascota.raza,
      edad: this.mascota.edad,
      clienteId: this.mascota.clienteId
    };

    this.mascotaService.actualizar(this.editando.id, dto).subscribe({
      next: (mascotaActualizada) => {
        Swal.fire('Actualizado', 'Mascota actualizada correctamente', 'success');

        // Actualizar la lista en memoria
        this.mascotas = this.mascotas.filter(m => m.id !== mascotaActualizada.id);
        this.mascotas.unshift(mascotaActualizada); // insertarlo como primero

        this.editando = null;
        this.resetFormulario();
        this.paginaActual = 1;
      },
      error: err => {
        console.error(err);
        Swal.fire('Error', 'No se pudo actualizar la mascota', 'error');
      }
    });
  }


  eliminarMascota(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la mascota permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.mascotaService.eliminar(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Mascota eliminada correctamente', 'success');
            this.cargarMascotas();
          },
          error: err => {
            console.error(err);
            Swal.fire('Error', 'No se pudo eliminar la mascota', 'error');
          }
        });
      }
    });
  }

  editarMascota(m: MascotaResponseDTO): void {
    this.clienteService.buscarPorId(m.clienteId).subscribe({
      next: (cliente) => {
        this.clienteEncontrado = cliente;
        this.mascota = {
          nombre: m.nombre,
          especie: m.especie,
          raza: m.raza,
          edad: m.edad,
          clienteId: m.clienteId
        };
        this.editando = m;
        Swal.fire('Modo Edición', `Editando a ${m.nombre}`, 'info');
      },
      error: () => {
        Swal.fire('Error', 'No se pudo obtener el cliente asociado', 'error');
      }
    });
  }

  resetFormulario(): void {
    this.mascota = {
      nombre: '',
      especie: '',
      raza: '',
      edad: 0,
      clienteId: 0
    };
    this.dniCliente = '';
    this.clienteEncontrado = null;
  }

  // --- PAGINACIÓN ---
  get mascotasPaginadas(): MascotaResponseDTO[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.mascotas.slice(inicio, inicio + this.itemsPorPagina);
  }

  totalPaginas(): number {
    return Math.ceil(this.mascotas.length / this.itemsPorPagina);
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas()) {
      this.paginaActual++;
    }
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }
}
