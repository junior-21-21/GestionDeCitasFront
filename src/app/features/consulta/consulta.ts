import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CitaService } from '../../services/cita.service';
import { ConsultaService } from '../../services/consulta.service';
import { VeterinarioService } from '../../services/veterinario.service';
import { MascotaService } from '../../services/mascota.service';
import { ProductoService } from '../../services/producto.service';
import { AuthService } from '../../services/auth.service';
import { ProductoDTO } from '../../models/producto.model';
import { ConsultaDTO } from '../../models/consulta.model';
import { VeterinarioResponseDTO } from '../../models/veterinario.model';
import { PacienteResponseDTO } from '../../models/mascota.model';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';

interface MedicamentoDetalle {
  nombre: string;
  indicacion: string;
  frecuencia: string;
  duracion: string;
}

interface CargoDetalle {
  descripcion: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  productoId?: string;
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
    estadoIngreso: '',
    estadoSalida: '',
    requiereInternamiento: false,
    motivoInternamiento: '',
    nivelUrgencia: 'NORMAL',
    temperatura: undefined,
    frecuenciaCardiaca: undefined,
    frecuenciaRespiratoria: undefined,
    tiempoLlenadoCapilar: undefined,
    sistemasAnormales: '[]'
  };

  sistemasEval: { [key: string]: boolean } = {
    digestivo: false,
    respiratorio: false,
    nervioso: false,
    cardiovascular: false,
    pielPelaje: false,
    musculoEsqueletico: false,
    urogenital: false
  };

  mascotaInfo: PacienteResponseDTO | null = null;
  veterinarioInfo: VeterinarioResponseDTO | null = null;

  veterinarios: VeterinarioResponseDTO[] = [];
  mascotas: PacienteResponseDTO[] = [];
  productosInventario: ProductoDTO[] = [];

  citasPendientesFull: any[] = [];
  citasPendientes: any[] = [];
  diasDisponibles: string[] = [];
  fechaFiltro: string = '';
  pasoActual: number = 1;
  vieneDeCita: boolean = false;

  listaMedicamentos: MedicamentoDetalle[] = [];
  nuevoMedicamento: MedicamentoDetalle = { nombre: '', indicacion: '', frecuencia: '', duracion: '' };
  indicacionesGenerales: string = '';

  listaCargos: CargoDetalle[] = [];
  nuevoCargo: Partial<CargoDetalle> = { descripcion: '', precio: undefined, cantidad: 1, productoId: '' };
  totalCobro: number = 0;

  codigoConsultaRegistrada: string = '';

  constructor(
    private consultaService: ConsultaService,
    private veterinarioService: VeterinarioService,
    private mascotaService: MascotaService,
    private route: ActivatedRoute,
    private router: Router,
    private citaService: CitaService,
    private productoService: ProductoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarVeterinarios();
    this.cargarMascotas();
    this.cargarProductos();
    this.autoDetectarVeterinario();

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
        const diasSet = new Set<string>();
        this.citasPendientesFull.forEach(c => {
           const diaStr = this.extraerDia(c.fechaHora);
           if(diaStr) diasSet.add(diaStr);
        });
        this.diasDisponibles = Array.from(diasSet).sort();
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
        error: () => {},
      });
    }
  }

  cargarDatosCita(codigoCita: string): void {
    this.citaService.obtenerPorCodigo(codigoCita).subscribe({
      next: (cita: any) => {
        this.consulta.motivo = cita.motivo;
        this.consulta.fecha = new Date().toISOString().split('T')[0];
        this.consulta.citaCodigo = codigoCita;

        this.mascotaService.buscarPorCodigo(cita.pacienteCodigo).subscribe({
          next: (mascota) => (this.mascotaInfo = mascota),
          error: () => {},
        });

        if (!this.veterinarioInfo) {
          const vet = this.veterinarios.find((v) => v.dni === cita.veterinarioDni);
          if (vet) {
            this.veterinarioInfo = vet;
          } else {
            this.veterinarioService.listar().subscribe({
              next: (vets: VeterinarioResponseDTO[]) => {
                this.veterinarioInfo = vets.find((v) => v.dni === cita.veterinarioDni) || null;
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
      error: () => Swal.fire('Error', 'No se pudo cargar la información de la cita', 'error'),
    });
  }

  cargarVeterinarios(): void {
    this.veterinarioService.listar().subscribe({
      next: (data: VeterinarioResponseDTO[]) => (this.veterinarios = data),
      error: (err: any) => console.error('Error cargando veterinarios', err),
    });
  }

  cargarMascotas(): void {
    this.mascotaService.listarTodas().subscribe({
      next: (data: PacienteResponseDTO[]) => (this.mascotas = data),
      error: (err: any) => console.error('Error cargando mascotas', err),
    });
  }

  cargarProductos(): void {
    this.productoService.listarTodos().subscribe({
      next: (data: ProductoDTO[]) => {
        this.productosInventario = data.filter(p => p.stockActual > 0 || p.tipoInventario === 'SERVICIO');
      },
      error: (err: any) => console.error('Error cargando productos', err)
    });
  }

  // --- Step 4 Receta ---
  onProductoRecetaChange(codigoBarras: string): void {
    if (!codigoBarras) {
      this.nuevoMedicamento.nombre = '';
      return;
    }
    const prod = this.productosInventario.find(p => p.codigoBarras === codigoBarras);
    if (prod) {
      this.nuevoMedicamento.nombre = prod.nombre;
    }
  }

  agregarMedicamento(): void {
    if (!this.nuevoMedicamento.nombre.trim() || !this.nuevoMedicamento.frecuencia.trim()) {
      Swal.fire('Atención', 'Ingrese al menos el nombre y la frecuencia del medicamento', 'warning');
      return;
    }
    this.listaMedicamentos.push({ ...this.nuevoMedicamento });
    this.nuevoMedicamento = { nombre: '', indicacion: '', frecuencia: '', duracion: '' };
  }

  eliminarMedicamento(index: number): void {
    this.listaMedicamentos.splice(index, 1);
  }

  // --- Step 5 Cargos ---
  onProductoCargoChange(codigoBarras: string): void {
    if (!codigoBarras) {
      this.nuevoCargo.descripcion = '';
      this.nuevoCargo.precio = undefined;
      return;
    }
    const prod = this.productosInventario.find(p => p.codigoBarras === codigoBarras);
    if (prod) {
      this.nuevoCargo.descripcion = prod.nombre;
      this.nuevoCargo.precio = prod.precioVenta;
    }
  }

  agregarCargo(): void {
    if (!this.nuevoCargo.descripcion || !this.nuevoCargo.precio || !this.nuevoCargo.cantidad) {
      Swal.fire('Atención', 'Ingrese descripción, precio y cantidad', 'warning');
      return;
    }
    const subtotal = this.nuevoCargo.precio * this.nuevoCargo.cantidad;
    this.listaCargos.push({
      descripcion: this.nuevoCargo.descripcion,
      precio: this.nuevoCargo.precio,
      cantidad: this.nuevoCargo.cantidad,
      subtotal: subtotal,
      productoId: this.nuevoCargo.productoId
    });
    this.calcularTotal();
    this.nuevoCargo = { descripcion: '', precio: undefined, cantidad: 1, productoId: '' };
  }

  eliminarCargo(index: number): void {
    this.listaCargos.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal(): void {
    this.totalCobro = this.listaCargos.reduce((acc, curr) => acc + curr.subtotal, 0);
  }

  // --- Stepper Navigation ---
  irPaso(paso: number): void {
    if (paso > 1 && !this.validarPaso1()) return;
    if (paso > 2 && !this.validarPaso2()) return;
    if (paso > 3 && !this.validarPaso3()) return;
    this.pasoActual = paso;
  }

  validarPaso1(): boolean {
    if (!this.consulta.citaCodigo) {
      Swal.fire('Atención', 'Seleccione una cita previa obligatoriamente', 'warning');
      return false;
    }
    if (!this.consulta.motivo?.trim()) {
      Swal.fire('Atención', 'Ingrese el motivo de la consulta', 'warning');
      return false;
    }
    return true;
  }

  validarPaso2(): boolean {
    if (!this.consulta.peso) {
      Swal.fire('Atención', 'Es recomendable ingresar el peso de la mascota', 'warning');
    }
    return true;
  }

  validarPaso3(): boolean {
    if (!this.consulta.diagnostico?.trim()) {
      Swal.fire('Atención', 'Ingrese el diagnóstico de la mascota', 'warning');
      return false;
    }
    return true;
  }

  // --- Registrar consulta, receta y cobros ---
  registrar(): void {
    if (this.listaCargos.length === 0) {
      Swal.fire('Atención', 'Debe agregar al menos un cargo en el Paso 5 (ej. Costo de Consulta) para que caja pueda realizar el cobro.', 'warning');
      return;
    }

    // Convertir array de sistemas anormales a JSON
    const anormales = Object.keys(this.sistemasEval).filter(k => this.sistemasEval[k]);
    this.consulta.sistemasAnormales = JSON.stringify(anormales);

    this.consultaService.registrarConsulta(this.consulta).subscribe({
      next: (consultaCreada: any) => {
        this.codigoConsultaRegistrada = consultaCreada.codigoConsulta || '';

        let promises = [];
        if (this.listaMedicamentos.length > 0 || this.indicacionesGenerales) {
          promises.push(this.guardarReceta(this.codigoConsultaRegistrada));
        }
        if (this.listaCargos.length > 0) {
          promises.push(this.guardarCobro(this.codigoConsultaRegistrada));
        }

        Promise.all(promises).then(() => {
          this.mostrarExito();
        }).catch(() => {
          Swal.fire('Advertencia', 'Consulta registrada pero hubo un error con la receta o cobros.', 'warning');
          this.mostrarExito();
        });
      },
      error: (err) => {
        Swal.fire('Error', err.error?.mensaje || 'No se pudo registrar la consulta', 'error');
      },
    });
  }

  private guardarReceta(codigoConsulta: string): Promise<void> {
    const url = `${environment.apiUrl}/recetas/consulta/${codigoConsulta}`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.getToken()}`
      },
      body: JSON.stringify({
        medicamentos: JSON.stringify(this.listaMedicamentos),
        indicaciones: this.indicacionesGenerales
      })
    }).then(res => {
      if (!res.ok) throw new Error('Error receta');
    });
  }

  private guardarCobro(codigoConsulta: string): Promise<void> {
    const url = `${environment.apiUrl}/cobros/consulta/${codigoConsulta}`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.getToken()}`
      },
      body: JSON.stringify({
        estado: 'PENDIENTE',
        total: this.totalCobro,
        detalleCargos: JSON.stringify(this.listaCargos)
      })
    }).then(res => {
      if (!res.ok) throw new Error('Error cobros');
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
    this.consultaService.descargarRecetaPdf(this.codigoConsultaRegistrada).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () => Swal.fire('Error', 'No se pudo descargar la receta médica', 'error'),
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
      estadoIngreso: '',
      estadoSalida: '',
      requiereInternamiento: false,
      motivoInternamiento: '',
      nivelUrgencia: 'NORMAL',
      temperatura: undefined,
      frecuenciaCardiaca: undefined,
      frecuenciaRespiratoria: undefined,
      tiempoLlenadoCapilar: undefined,
      sistemasAnormales: '[]'
    };
    this.sistemasEval = {
      digestivo: false, respiratorio: false, nervioso: false,
      cardiovascular: false, pielPelaje: false, musculoEsqueletico: false, urogenital: false
    };
    this.listaMedicamentos = [];
    this.nuevoMedicamento = { nombre: '', indicacion: '', frecuencia: '', duracion: '' };
    this.indicacionesGenerales = '';
    this.listaCargos = [];
    this.nuevoCargo = { descripcion: '', precio: undefined, cantidad: 1, productoId: '' };
    this.totalCobro = 0;
    this.mascotaInfo = null;
    this.pasoActual = 1;
    this.codigoConsultaRegistrada = '';
    this.vieneDeCita = false;
    this.autoDetectarVeterinario();
  }
}
