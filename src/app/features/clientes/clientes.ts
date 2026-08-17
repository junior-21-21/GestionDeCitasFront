import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { ExternalApiService } from '../../services/external-api.service'; // Importante
import { ReporteService } from '../../services/reporte.service';
import Swal from 'sweetalert2';

// Definimos la interfaz aquí mismo si no la tienes en un archivo separado
export interface Cliente {
  nombres: string;
  apellidos: string;
  dni: string;
  calle?: string;
  numero?: string;
  distrito?: string;
  provincia?: string;
  telefonos?: { numero: string; tipo: string }[];
  puntosFidelidad?: number;
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.scss']
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  filtroBusqueda: string = '';

  // ── Provincias y Distritos de Ayacucho ────────────────────────────────────
  readonly provinciaDistritoMap: Record<string, string[]> = {
    'Huamanga': [
      'Ayacucho', 'Acocro', 'Acos Vinchos', 'Carmen Alto', 'Chiara',
      'Jesús Nazareno', 'Ocros', 'Pacaycasa', 'Quinua', 'San José de Ticllas',
      'San Juan Bautista', 'Santiago de Pischa', 'Socos', 'Tambillo',
      'Vinchos', 'Andrés Avelino Cáceres Dorregaray'
    ],
    'Cangallo': [
      'Cangallo', 'Chuschi', 'Los Morochucos', 'María Parado de Bellido',
      'Paras', 'Totos'
    ],
    'Huanca Sancos': [
      'Carapo', 'Sacsamarca', 'Sancos', 'Santiago de Lucanamarca'
    ],
    'Huanta': [
      'Huanta', 'Ayahuanco', 'Huamanguilla', 'Iguaín', 'Llochegua',
      'Canayre', 'Uchuraccay', 'Pucacolpa', 'Santillana'
    ],
    'La Mar': [
      'San Miguel', 'Anco', 'Ayna', 'Chilcas', 'Chungui',
      'Luis Carranza', 'Santa Rosa', 'Tambo', 'Samugari', 'Anchihuay'
    ],
    'Lucanas': [
      'Puquio', 'Aucara', 'Cabana', 'Carmen Salcedo', 'Chaviña',
      'Chipao', 'Huac-Huas', 'Laramate', 'Leoncio Prado', 'Llauta',
      'Lucanas', 'Ocaña', 'Otoca', 'Saisa', 'San Cristóbal',
      'San Juan', 'San Pedro', 'San Pedro de Palco', 'Sancos',
      'Santa Ana de Huaycahuacho', 'Santa Lucía'
    ],
    'Parinacochas': [
      'Coracora', 'Chumpi', 'Coronel Castañeda', 'Pacapausa',
      'Pullo', 'Puyusca', 'San Francisco de Rivacayco', 'Upahuacho'
    ],
    'Páucar del Sara Sara': [
      'Pausa', 'Colta', 'Corculla', 'Lampa', 'Marcabamba',
      'Oyolo', 'Pararca', 'San Javier de Alpabamba',
      'San José de Ushua', 'Sara Sara'
    ],
    'Sucre': [
      'Querobamba', 'Belén', 'Chalcos', 'Chilcayoc', 'Huacaña',
      'Morcolla', 'Paico', 'San Salvador de Quije',
      'Santiago de Paucaray', 'Soras'
    ],
    'Víctor Fajardo': [
      'Huancapi', 'Alcamenca', 'Apongo', 'Asquipata', 'Canaria',
      'Cayara', 'Colca', 'Huamanquiquia', 'Huancaraylla',
      'Huaya', 'Sarhua', 'Vilcanchos'
    ],
    'Vilcas Huamán': [
      'Vilcas Huamán', 'Accomarca', 'Carhuanca', 'Concepción',
      'Huambalpa', 'Independencia', 'Saurama', 'Vischongo'
    ]
  };

  get provincias(): string[] {
    return Object.keys(this.provinciaDistritoMap);
  }

  distritosFiltrados: string[] = [];

  onProvinciaChange(): void {
    const prov = this.nuevoCliente.provincia || '';
    this.distritosFiltrados = this.provinciaDistritoMap[prov] ?? [];
    this.nuevoCliente.distrito = '';
  }
  // ─────────────────────────────────────────────────────────────────────────

  nuevoCliente: Cliente = {
    nombres: '',
    apellidos: '',
    dni: '',
    calle: '',
    numero: '',
    distrito: '',
    provincia: '',
    telefonos: []
  };

  modoEditar = false;
  mensajeExito: string = '';
  mensajeError: string = '';
  buscandoDniExterno: boolean = false;

  constructor(
    private clienteService: ClienteService,
    private reporteService: ReporteService,
    private externalApiService: ExternalApiService
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.clienteService.listar().subscribe({
      next: (data) => {
        this.clientes = data;
        this.filtrar(); // Aplicar filtro inicial (o mostrar todos)
      },
      error: (err) => this.mostrarError('Error al cargar clientes')
    });
  }

  filtrar(): void {
    if (!this.filtroBusqueda) {
      this.clientesFiltrados = this.clientes;
      return;
    }
    
    const termino = this.filtroBusqueda.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(c => 
      c.dni.includes(termino) || 
      c.nombres.toLowerCase().includes(termino) || 
      c.apellidos.toLowerCase().includes(termino)
    );
  }

  exportarExcel(): void {
    this.reporteService.exportarClientes();
  }

  buscarDniExterno(): void {
    if (!this.nuevoCliente.dni || this.nuevoCliente.dni.length !== 8) {
      this.mostrarError('El DNI debe tener 8 dígitos');
      return;
    }

    this.buscandoDniExterno = true;
    this.externalApiService.getDni(this.nuevoCliente.dni).subscribe({
      next: (data) => {
        this.buscandoDniExterno = false;
        if (data && data.nombres) {
          this.nuevoCliente.nombres = data.nombres;
          this.nuevoCliente.apellidos = `${data.apellidoPaterno} ${data.apellidoMaterno}`;
          this.nuevoCliente.calle = ''; 
          
          Swal.fire({
            icon: 'success',
            title: 'Datos Encontrados',
            text: `Se encontraron los datos de: ${data.nombres} ${data.apellidoPaterno}`,
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          Swal.fire('Info', 'No se encontraron datos para este DNI', 'info');
        }
      },
      error: (err) => {
        this.buscandoDniExterno = false;
        console.error(err);
        this.mostrarError('Error al consultar DNI externo');
      }
    });
  }

  guardar(): void {
    // 1. Validaciones básicas
    if (!this.nuevoCliente.nombres || !this.nuevoCliente.apellidos) {
      this.mostrarError('Nombre y Apellidos son obligatorios');
      return;
    }
    if (!this.nuevoCliente.dni || this.nuevoCliente.dni.length !== 8) {
      this.mostrarError('El DNI debe tener 8 dígitos');
      return;
    }

    // 2. Lógica Guardar/Editar
    if (this.modoEditar && this.nuevoCliente.dni) {
      this.clienteService.actualizar(this.nuevoCliente.dni, this.nuevoCliente).subscribe({
        next: () => {
          this.mostrarExito('Cliente actualizado correctamente');
          this.listar();
          this.reset();
        },
        error: () => this.mostrarError('No se pudo actualizar')
      });
    } else {
      this.clienteService.crear(this.nuevoCliente).subscribe({
        next: (resp) => {
          this.mostrarExito('Cliente registrado correctamente');
          this.clientes.push(resp); // O this.listar()
          this.reset();
        },
        error: () => this.mostrarError('No se pudo registrar')
      });
    }
  }

  editar(cliente: Cliente): void {
    this.modoEditar = true;
    this.nuevoCliente = { ...cliente };
    // Al editar, cargar los distritos de la provincia guardada
    this.distritosFiltrados = this.provinciaDistritoMap[cliente.provincia ?? ''] ?? [];
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(dni: string): void {
    Swal.fire({
      title: '¿Eliminar cliente?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.clienteService.eliminar(dni).subscribe({
          next: () => {
            this.clientes = this.clientes.filter(c => c.dni !== dni);
            this.filtrar();
            Swal.fire('Eliminado', 'El cliente ha sido eliminado.', 'success');
          },
          error: (err) => {
             Swal.fire('Error', 'No se pudo eliminar el cliente (posiblemente tenga pacientes asociados).', 'error');
          }
        });
      }
    });
  }

  agregarTelefono(): void {
    if (!this.nuevoCliente.telefonos) {
      this.nuevoCliente.telefonos = [];
    }
    this.nuevoCliente.telefonos.push({ numero: '', tipo: 'CELULAR' });
  }

  eliminarTelefono(index: number): void {
    if (this.nuevoCliente.telefonos) {
      this.nuevoCliente.telefonos.splice(index, 1);
    }
  }

  reset(): void {
    this.modoEditar = false;
    this.nuevoCliente = {
      nombres: '',
      apellidos: '',
      dni: '',
      calle: '',
      numero: '',
      distrito: '',
      provincia: '',
      telefonos: []
    };
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  // Helpers para mensajes visuales
  mostrarExito(msg: string) {
    this.mensajeExito = msg;
    this.mensajeError = '';
    setTimeout(() => this.mensajeExito = '', 4000);
  }

  mostrarError(msg: string) {
    this.mensajeError = msg;
    this.mensajeExito = '';
    setTimeout(() => this.mensajeError = '', 4000);
  }
}