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
} from '../../models/consulta.model';
import { VeterinarioResponseDTO } from '../../models/veterinario.model';
import { PacienteResponseDTO } from '../../models/mascota.model';
import Swal from 'sweetalert2';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface RecetaMedica {
  medicamentos: string;
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
    citaCodigo: '',
  };

  // Info cards
  mascotaInfo: PacienteResponseDTO | null = null;
  veterinarioInfo: VeterinarioResponseDTO | null = null;

  // Datos para dropdowns (fallback cuando no viene de cita)
  veterinarios: VeterinarioResponseDTO[] = [];
  mascotas: PacienteResponseDTO[] = [];

  // Stepper
  citasPendientesFull: any[] = [];
  citasPendientes: any[] = [];
  diasDisponibles: string[] = []; // Días que realmente tienen citas
  fechaFiltro: string = '';
  pasoActual: number = 1;
  vieneDeCita: boolean = false;

  recetaMedica: RecetaMedica = { medicamentos: '', indicaciones: '' };

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
    this.autoDetectarVeterinario();
    this.autoDetectarVeterinario();

    // Check for query params from Citas
    this.route.queryParams.subscribe((params) => {
      const citaCodigo = params['citaCodigo'];
      if (citaCodigo) {
        this.vieneDeCita = true;
        this.cargarDatosCita(citaCodigo);
      } else {
        this.cargarCitasPendientes();
      }
    });
  }

  cargarCitasPendientes(): void {
    this.citaService.listarPendientes().subscribe({
      next: (citas) => {
        this.citasPendientesFull = citas.filter((c: any) => c.nombrePaciente);
        
        // Extraer los días únicos que tienen citas
        const diasSet = new Set<string>();
        this.citasPendientesFull.forEach(c => {
           const diaStr = this.extraerDia(c.fechaHora);
           if(diaStr) diasSet.add(diaStr);
        });
        
        this.diasDisponibles = Array.from(diasSet).sort();
        
        // Seleccionar por defecto
        if (this.diasDisponibles.length > 0) {
           const hoyStr = new Date().toISOString().split('T')[0];
           if(this.diasDisponibles.includes(hoyStr)) {
               this.fechaFiltro = hoyStr;
           } else {
               this.fechaFiltro = this.diasDisponibles[0];
           }
        }
        
        this.filtrarCitasPorFecha();
      },
      error: () => console.error('No se pudieron cargar citas pendientes')
    });
  }

  extraerDia(fechaHora: any): string {
      if (!fechaHora) return '';
      if (Array.isArray(fechaHora)) {
        const y = fechaHora[0];
        const m = String(fechaHora[1]).padStart(2, '0');
        const d = String(fechaHora[2]).padStart(2, '0');
        return `${y}-${m}-${d}`;
      } else {
        return String(fechaHora).substring(0, 10);
      }
  }

  filtrarCitasPorFecha(dia?: string): void {
    if (dia) this.fechaFiltro = dia;
    
    if (!this.fechaFiltro) {
      this.citasPendientes = this.citasPendientesFull;
      return;
    }
    
    this.citasPendientes = this.citasPendientesFull.filter((c: any) => {
      return this.extraerDia(c.fechaHora) === this.fechaFiltro;
    });
  }

  onCitaSeleccionada(): void {
    if (this.consulta.citaCodigo) {
      this.cargarDatosCita(this.consulta.citaCodigo);
    }
  }

  seleccionarCita(codigo: string): void {
    this.consulta.citaCodigo = codigo;
    this.onCitaSeleccionada();
  }

  autoDetectarVeterinario(): void {
    const usuario = this.authService.getUsuario();
    if (usuario && usuario.rol === 'VETERINARIO') {
      this.veterinarioService.obtenerPorEmail(usuario.email).subscribe({
        next: (vet) => {
          this.veterinarioInfo = vet;
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

        if (this.vieneDeCita) {
          Swal.fire({
            title: 'Atendiendo Cita',
            text: `Datos cargados para la cita ${codigoCita}`,
            icon: 'info',
            timer: 2000,
            showConfirmButton: false,
          });
        }
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





  // --- Stepper ---
  irPaso(paso: number): void {
    if (paso === 2 && !this.validarPaso1()) return;
    if (paso === 3 && !this.validarPaso2()) return;
    this.pasoActual = paso;
  }

  validarPaso1(): boolean {
    if (!this.consulta.citaCodigo) {
      Swal.fire('Atención', 'Seleccione una cita previa obligatoriamente', 'warning');
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



  // --- Registrar consulta y receta ---
  registrar(): void {
    this.consultaService.registrarConsulta(this.consulta).subscribe({
      next: (consultaCreada: any) => {
        this.codigoConsultaRegistrada = consultaCreada.codigoConsulta || '';

        if ((this.recetaMedica.medicamentos || this.recetaMedica.indicaciones) && this.codigoConsultaRegistrada) {
          this.guardarReceta(this.codigoConsultaRegistrada);
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

  private guardarReceta(codigoConsulta: string): void {
    // Requires HttpClient which is not injected directly but we can use fetch or inject it.
    // Wait, let's inject HttpClient. I'll add it to constructor below if needed, but for now I'll use fetch as it's simpler here.
    const url = `${environment.apiUrl}/recetas/consulta/${codigoConsulta}`;
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.getToken()}`
      },
      body: JSON.stringify(this.recetaMedica)
    }).then(res => {
      if (res.ok) {
        this.mostrarExito();
      } else {
        throw new Error('Error al guardar receta');
      }
    }).catch(err => {
      Swal.fire('Advertencia', 'Consulta registrada pero hubo un error al guardar la receta.', 'warning');
      this.mostrarExito();
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
      citaCodigo: '',
    };
    this.mascotaInfo = null;
    this.recetaMedica = { medicamentos: '', indicaciones: '' };
    this.pasoActual = 1;
    this.codigoConsultaRegistrada = '';
    this.vieneDeCita = false;

    // Mantener veterinario auto-detectado
    this.autoDetectarVeterinario();
  }
}
