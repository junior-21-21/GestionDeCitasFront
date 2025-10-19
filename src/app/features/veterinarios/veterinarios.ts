import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VeterinarioService } from '../../services/veterinario.service';
import { EspecialidadService } from '../../services/especialidad.service';
import { VeterinarioDTO, VeterinarioResponseDTO } from '../../models/veterinario.model';
import { Especialidad } from '../../models/especialidad.model';

@Component({
  selector: 'app-veterinarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './veterinarios.html',
  styleUrls: ['./veterinarios.scss']
})
export class VeterinariosComponent implements OnInit {
  veterinarios: VeterinarioResponseDTO[] = [];
  especialidades: Especialidad[] = [];
  nuevoVet: VeterinarioDTO = { nombres: '', cmp: '', especialidadId: 0 };
  editando: VeterinarioResponseDTO | null = null;

  constructor(
    private vetService: VeterinarioService,
    private espService: EspecialidadService
  ) {}

  ngOnInit(): void {
    this.cargarVeterinarios();
    this.cargarEspecialidades();
  }

  cargarVeterinarios() {
    this.vetService.listar().subscribe(data => this.veterinarios = data);
  }

  cargarEspecialidades() {
    this.espService.listar().subscribe(data => this.especialidades = data);
  }

  guardar() {
    if (!this.nuevoVet.nombres || !this.nuevoVet.cmp || !this.nuevoVet.especialidadId) return;

    if (this.editando) {
      // Actualizar veterinario
      this.vetService.actualizar(this.editando.id, this.nuevoVet).subscribe({
        next: () => {
          this.cancelarEdicion();
          this.cargarVeterinarios();
        },
        error: err => alert('Error al actualizar: ' + err.error)
      });
    } else {
      // Registrar nuevo veterinario
      this.vetService.registrar(this.nuevoVet).subscribe({
        next: () => {
          this.nuevoVet = { nombres: '', cmp: '', especialidadId: 0 };
          this.cargarVeterinarios();
        },
        error: err => alert('Error al registrar: ' + err.error)
      });
    }
  }

  editar(v: VeterinarioResponseDTO) {
    this.editando = v;
    this.nuevoVet = {
      nombres: v.nombres,
      cmp: v.cmp,
      especialidadId: this.obtenerIdEspecialidad(v.especialidad)
    };
  }

  cancelarEdicion() {
    this.editando = null;
    this.nuevoVet = { nombres: '', cmp: '', especialidadId: 0 };
  }

  eliminar(id: number) {
    if (!confirm('¿Deseas eliminar este veterinario?')) return;
    this.vetService.eliminar(id).subscribe(() => this.cargarVeterinarios());
  }

  private obtenerIdEspecialidad(nombre: string): number {
    const esp = this.especialidades.find(e => e.nombre === nombre);
    return esp?.id ?? 0;
  }
}
