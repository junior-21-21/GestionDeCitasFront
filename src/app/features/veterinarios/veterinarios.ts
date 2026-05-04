import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('formCard') formCard!: ElementRef;

  veterinarios: VeterinarioResponseDTO[] = [];
  veterinariosFiltrados: VeterinarioResponseDTO[] = [];
  especialidades: Especialidad[] = [];
  nuevoVet: VeterinarioDTO = { nombres: '', dni: '', celular: '', correo: '', especialidadId: 0 };
  editando: VeterinarioResponseDTO | null = null;

  // Archivos
  fotoFile: File | null = null;
  tituloFile: File | null = null;
  fotoPreview: string | null = null;
  tituloNombre: string | null = null;
  dragOverFoto = false;

  // Filtros
  filtroNombre = '';
  filtroDni = '';
  filtroEspecialidad = '';

  constructor(
    private vetService: VeterinarioService,
    private espService: EspecialidadService
  ) {}

  ngOnInit(): void {
    this.cargarVeterinarios();
    this.cargarEspecialidades();
  }

  cargarVeterinarios() {
    this.vetService.listar().subscribe(data => {
      this.veterinarios = data;
      this.aplicarFiltros();
    });
  }

  cargarEspecialidades() {
    this.espService.listar().subscribe(data => this.especialidades = data);
  }

  // ========== FILTROS ==========
  aplicarFiltros() {
    this.veterinariosFiltrados = this.veterinarios.filter(vet => {
      const coincideNombre = !this.filtroNombre ||
        vet.nombres.toLowerCase().includes(this.filtroNombre.toLowerCase());
      const coincideDni = !this.filtroDni ||
        (vet.dni && vet.dni.includes(this.filtroDni));
      const coincideEspecialidad = !this.filtroEspecialidad ||
        vet.especialidad === this.filtroEspecialidad;
      return coincideNombre && coincideDni && coincideEspecialidad;
    });
  }

  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroDni = '';
    this.filtroEspecialidad = '';
    this.aplicarFiltros();
  }

  // ========== EXCEL ==========
  exportarExcel() {
    this.vetService.exportarExcel();
  }

  // ========== ARCHIVOS ==========
  onFotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.fotoFile = input.files[0];
      this.generarPreviewFoto(this.fotoFile);
    }
  }

  onTituloSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.tituloFile = input.files[0];
      this.tituloNombre = this.tituloFile.name;
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverFoto = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverFoto = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverFoto = false;

    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        this.fotoFile = file;
        this.generarPreviewFoto(file);
      }
    }
  }

  private generarPreviewFoto(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.fotoPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  getFotoUrl(fotoUrl: string): string {
    if (!fotoUrl) return '';
    return this.vetService.getArchivoUrl(fotoUrl);
  }

  getTituloUrl(tituloUrl: string): string {
    if (!tituloUrl) return '';
    return this.vetService.getArchivoUrl(tituloUrl);
  }

  // ========== CRUD ==========
  guardar() {
    if (!this.nuevoVet.nombres || !this.nuevoVet.dni || !this.nuevoVet.celular || !this.nuevoVet.correo || !this.nuevoVet.especialidadId) return;

    if (this.editando) {
      this.vetService.actualizar(
        this.editando.dni,
        this.nuevoVet,
        this.fotoFile || undefined,
        this.tituloFile || undefined
      ).subscribe({
        next: () => {
          this.cancelarEdicion();
          this.cargarVeterinarios();
        },
        error: err => alert('Error al actualizar: ' + (err.error?.message || err.error || err.message))
      });
    } else {
      this.vetService.registrar(
        this.nuevoVet,
        this.fotoFile || undefined,
        this.tituloFile || undefined
      ).subscribe({
        next: () => {
          this.limpiarFormulario();
          this.cargarVeterinarios();
        },
        error: err => alert('Error al registrar: ' + (err.error?.message || err.error || err.message))
      });
    }
  }

  editar(v: VeterinarioResponseDTO) {
    this.editando = v;
    this.nuevoVet = {
      nombres: v.nombres,
      dni: v.dni || '',
      celular: v.celular || '',
      correo: v.correo || '',
      especialidadId: this.obtenerIdEspecialidad(v.especialidad)
    };
    this.fotoFile = null;
    this.tituloFile = null;
    this.fotoPreview = v.fotoUrl ? this.getFotoUrl(v.fotoUrl) : null;
    this.tituloNombre = v.tituloUrl ? 'Título actual cargado' : null;

    // Scroll al formulario
    setTimeout(() => {
      this.formCard?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  cancelarEdicion() {
    this.editando = null;
    this.limpiarFormulario();
  }

  private limpiarFormulario() {
    this.nuevoVet = { nombres: '', dni: '', celular: '', correo: '', especialidadId: 0 };
    this.fotoFile = null;
    this.tituloFile = null;
    this.fotoPreview = null;
    this.tituloNombre = null;
  }

  eliminar(dni: string) {
    if (!confirm('¿Deseas eliminar este veterinario?')) return;
    this.vetService.eliminar(dni).subscribe(() => this.cargarVeterinarios());
  }

  private obtenerIdEspecialidad(nombre: string): number {
    const esp = this.especialidades.find(e => e.nombre === nombre);
    return esp?.id ?? 0;
  }
}
