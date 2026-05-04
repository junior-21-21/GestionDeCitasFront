import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CitaService } from '../../services/cita.service';
import { ConsultaService } from '../../services/consulta.service';
import { VeterinarioService } from '../../services/veterinario.service';
import { MascotaService } from '../../services/mascota.service';
import { ProductoService } from '../../services/producto.service';
import { ConsultaProductoService } from '../../services/consulta-producto.service';
import { AuthService } from '../../services/auth.service';
import { ProductoDTO } from '../../models/producto.model';
import {
  ConsultaDTO,
  ConsultaProductoDTO,
  ConsultaProductoResponse,
} from '../../models/consulta.model';
import { VeterinarioResponseDTO } from '../../models/veterinario.model';
import { PacienteResponseDTO } from '../../models/mascota.model';
import Swal from 'sweetalert2';

interface RecetaItem {
  codigoBarras: string;
  nombre: string;
  cantidad: number;
  indicaciones: string;
}

@Component({
  selector: 'app-consultas',
  standalone: true,
  templateUrl: './consulta.html',
  styleUrls: ['./consulta.scss'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class ConsultasComponent implements OnInit {
  consulta: ConsultaDTO = {
    fecha: new Date().toISOString().split('T')[0],
    motivo: '',
    peso: undefined,
    observaciones: '',
    diagnostico: '',
    tratamiento: '',
    pacienteCodigo: '',
    veterinarioDni: '',
    citaCodigo: undefined,
  };

  // Info cards
  mascotaInfo: PacienteResponseDTO | null = null;
  veterinarioInfo: VeterinarioResponseDTO | null = null;

  // Datos para dropdowns (fallback cuando no viene de cita)
  veterinarios: VeterinarioResponseDTO[] = [];
  mascotas: PacienteResponseDTO[] = [];

  // Stepper
  pasoActual: number = 1;
  vieneDeCita: boolean = false;

  // Receta integrada
  productos: ProductoDTO[] = [];
  filtroProducto: string = '';
  recetaItems: RecetaItem[] = [];
  indicacionesTemp: string = '';

  // Código de la consulta registrada (para asociar productos después)
  codigoConsultaRegistrada: string = '';

  constructor(
    private consultaService: ConsultaService,
    private veterinarioService: VeterinarioService,
    private mascotaService: MascotaService,
    private route: ActivatedRoute,
    private router: Router,
    private citaService: CitaService,
    private productoService: ProductoService,
    private consultaProductoService: ConsultaProductoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarVeterinarios();
    this.cargarMascotas();
    this.cargarProductos();
    this.autoDetectarVeterinario();

    // Check for query params from Citas
    this.route.queryParams.subscribe((params) => {
      const citaCodigo = params['citaCodigo'];
      if (citaCodigo) {
        this.vieneDeCita = true;
        this.cargarDatosCita(citaCodigo);
      }
    });
  }

  autoDetectarVeterinario(): void {
    const usuario = this.authService.getUsuario();
    if (usuario && usuario.rol === 'VETERINARIO') {
      this.veterinarioService.obtenerPorEmail(usuario.email).subscribe({
        next: (vet) => {
          this.veterinarioInfo = vet;
          this.consulta.veterinarioDni = vet.dni;
        },
        error: () => {
          // Si falla, se cargará desde el dropdown
        },
      });
    }
  }

  cargarDatosCita(codigoCita: string): void {
    this.citaService.obtenerPorCodigo(codigoCita).subscribe({
      next: (cita: any) => {
        this.consulta.pacienteCodigo = cita.pacienteCodigo;
        this.consulta.veterinarioDni = cita.veterinarioDni;
        this.consulta.motivo = cita.motivo;
        this.consulta.fecha = new Date().toISOString().split('T')[0];
        this.consulta.citaCodigo = codigoCita;

        // Cargar info de mascota
        this.mascotaService.buscarPorCodigo(cita.pacienteCodigo).subscribe({
          next: (mascota) => (this.mascotaInfo = mascota),
          error: () => {},
        });

        // Cargar info de veterinario si no se auto-detectó
        if (!this.veterinarioInfo) {
          const vet = this.veterinarios.find(
            (v) => v.dni === cita.veterinarioDni
          );
          if (vet) {
            this.veterinarioInfo = vet;
          } else {
            // Esperar a que carguen los veterinarios
            this.veterinarioService.listar().subscribe({
              next: (vets) => {
                this.veterinarioInfo =
                  vets.find((v) => v.dni === cita.veterinarioDni) || null;
              },
            });
          }
        }

        Swal.fire({
          title: 'Atendiendo Cita',
          text: `Datos cargados para la cita ${codigoCita}`,
          icon: 'info',
          timer: 2000,
          showConfirmButton: false,
        });
      },
      error: () =>
        Swal.fire(
          'Error',
          'No se pudo cargar la información de la cita',
          'error'
        ),
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

  cargarProductos(): void {
    this.productoService.listarTodos().subscribe({
      next: (data) => (this.productos = data),
      error: () => console.error('No se pudieron cargar los productos'),
    });
  }

  // Cuando el usuario selecciona un paciente del dropdown (modo no-cita)
  onPacienteSeleccionado(): void {
    if (this.consulta.pacienteCodigo) {
      this.mascotaService
        .buscarPorCodigo(this.consulta.pacienteCodigo)
        .subscribe({
          next: (mascota) => (this.mascotaInfo = mascota),
          error: () => (this.mascotaInfo = null),
        });
    } else {
      this.mascotaInfo = null;
    }
  }

  // Cuando el usuario selecciona un veterinario del dropdown
  onVeterinarioSeleccionado(): void {
    if (this.consulta.veterinarioDni) {
      this.veterinarioInfo =
        this.veterinarios.find(
          (v) => v.dni === this.consulta.veterinarioDni
        ) || null;
    } else {
      this.veterinarioInfo = null;
    }
  }

  // --- Stepper ---
  irPaso(paso: number): void {
    if (paso === 2 && !this.validarPaso1()) return;
    if (paso === 3 && !this.validarPaso2()) return;
    this.pasoActual = paso;
  }

  validarPaso1(): boolean {
    if (!this.consulta.pacienteCodigo) {
      Swal.fire('Atención', 'Seleccione un paciente', 'warning');
      return false;
    }
    if (!this.consulta.veterinarioDni) {
      Swal.fire('Atención', 'Seleccione un veterinario', 'warning');
      return false;
    }
    return true;
  }

  validarPaso2(): boolean {
    if (!this.consulta.motivo?.trim()) {
      Swal.fire('Atención', 'Ingrese el motivo de la consulta', 'warning');
      return false;
    }
    if (!this.consulta.diagnostico?.trim()) {
      Swal.fire('Atención', 'Ingrese el diagnóstico', 'warning');
      return false;
    }
    if (!this.consulta.tratamiento?.trim()) {
      Swal.fire('Atención', 'Ingrese el tratamiento', 'warning');
      return false;
    }
    return true;
  }

  // --- Receta ---
  get productosFiltrados(): ProductoDTO[] {
    const f = this.filtroProducto.toLowerCase().trim();
    if (!f) return [];
    return this.productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(f) ||
        (p.codigoBarras && p.codigoBarras.toString().includes(f))
    );
  }

  agregarAReceta(prod: ProductoDTO): void {
    const existente = this.recetaItems.find(
      (r) => r.codigoBarras === prod.codigoBarras
    );
    if (existente) {
      Swal.fire(
        'Atención',
        'Este producto ya está en la receta. Puede editar la cantidad.',
        'info'
      );
      return;
    }
    this.recetaItems.push({
      codigoBarras: prod.codigoBarras,
      nombre: prod.nombre,
      cantidad: 1,
      indicaciones: '',
    });
    this.filtroProducto = '';
  }

  quitarDeReceta(index: number): void {
    this.recetaItems.splice(index, 1);
  }

  // --- Registrar consulta y receta ---
  registrar(): void {
    this.consultaService.registrarConsulta(this.consulta).subscribe({
      next: (consultaCreada: any) => {
        this.codigoConsultaRegistrada = consultaCreada.codigoConsulta || '';

        if (this.recetaItems.length > 0 && this.codigoConsultaRegistrada) {
          this.asociarProductosSecuencial(0);
        } else {
          this.mostrarExito();
        }
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

  private asociarProductosSecuencial(index: number): void {
    if (index >= this.recetaItems.length) {
      this.mostrarExito();
      return;
    }

    const item = this.recetaItems[index];
    const dto: ConsultaProductoDTO = {
      codigoConsulta: this.codigoConsultaRegistrada,
      codigoBarras: item.codigoBarras,
      cantidad: item.cantidad,
      indicaciones: item.indicaciones || 'Según indicación médica',
    };

    this.consultaProductoService.agregarProducto(dto).subscribe({
      next: () => this.asociarProductosSecuencial(index + 1),
      error: () => {
        Swal.fire(
          'Advertencia',
          `No se pudo asociar el producto "${item.nombre}". Los demás se registraron correctamente.`,
          'warning'
        );
        this.asociarProductosSecuencial(index + 1);
      },
    });
  }

  private mostrarExito(): void {
    Swal.fire({
      title: '¡Diagnóstico Registrado!',
      text: 'La consulta y receta se registraron correctamente.',
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Descargar Receta PDF',
      cancelButtonText: 'Finalizar',
      confirmButtonColor: '#667eea',
    }).then((result) => {
      if (result.isConfirmed && this.codigoConsultaRegistrada) {
        this.descargarReceta();
      }
      this.resetFormulario();
    });
  }

  descargarReceta(): void {
    if (!this.codigoConsultaRegistrada) return;
    this.consultaService
      .descargarRecetaPdf(this.codigoConsultaRegistrada)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `receta_${this.codigoConsultaRegistrada}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: () => {
          Swal.fire(
            'Error',
            'No se pudo descargar la receta médica',
            'error'
          );
        },
      });
  }

  resetFormulario(): void {
    this.consulta = {
      fecha: new Date().toISOString().split('T')[0],
      motivo: '',
      peso: undefined,
      observaciones: '',
      diagnostico: '',
      tratamiento: '',
      pacienteCodigo: '',
      veterinarioDni: '',
    };
    this.mascotaInfo = null;
    this.recetaItems = [];
    this.pasoActual = 1;
    this.codigoConsultaRegistrada = '';
    this.filtroProducto = '';
    this.vieneDeCita = false;

    // Mantener veterinario auto-detectado
    this.autoDetectarVeterinario();
  }
}
