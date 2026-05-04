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
  telefono?: string;
  direccion?: string;
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
  clientesFiltrados: Cliente[] = []; // Lista para la tabla
  filtroBusqueda: string = ''; // Texto del buscador
  
  // Objeto inicial con todos los campos de tu BD
  nuevoCliente: Cliente = {
    nombres: '',
    apellidos: '',
    dni: '',
    telefono: '',
    direccion: ''
  };

  modoEditar = false;
  mensajeExito: string = '';

  mensajeError: string = '';
  buscandoDniExterno: boolean = false; // Estado para el loading

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
          this.nuevoCliente.direccion = ''; 
          
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
    // Copiamos el objeto para no modificar la tabla directamente mientras editamos
    this.nuevoCliente = { ...cliente };
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

  reset(): void {
    this.modoEditar = false;
    this.nuevoCliente = {
      nombres: '',
      apellidos: '',
      dni: '',
      telefono: '',
      direccion: ''
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