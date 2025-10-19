import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.service';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.scss']
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  nuevoCliente: Cliente = this.nuevoClienteInicial();
  modoEditar = false;
  clienteEditandoId: number | null = null;
  modo: 'registro' | 'lista' = 'registro';
  mensajeExito: string = '';
  mensajeError: string = '';
  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.clienteService.listar().subscribe({
      next: data => this.clientes = data,
      error: err => Swal.fire('Error', 'No se pudieron cargar los clientes.', 'error')
    });
  }

  guardar(): void {
    if (!this.nuevoCliente.nombres || !this.nuevoCliente.dni || this.nuevoCliente.dni.length !== 8) {
      Swal.fire('Error', 'Debe ingresar un nombre y un DNI válido (8 dígitos).', 'warning');
      return;
    }

    if (this.modoEditar && this.clienteEditandoId !== null) {
      this.clienteService.actualizar(this.clienteEditandoId, this.nuevoCliente).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'Cliente actualizado correctamente.', 'success');
          this.listar();
          this.reset();
        },
        error: err => Swal.fire('Error', 'No se pudo actualizar el cliente.', 'error')
      });
    } else {
      this.clienteService.crear(this.nuevoCliente).subscribe({
        next: (clienteCreado) => {
          Swal.fire('Registrado', 'Cliente registrado correctamente.', 'success');
          this.clientes.push(clienteCreado);
          this.reset();
        },
        error: err => Swal.fire('Error', 'No se pudo registrar el cliente.', 'error')
      });
    }
  }

  editar(cliente: Cliente): void {
    this.modoEditar = true;
    this.clienteEditandoId = cliente.id!;
    this.nuevoCliente = { ...cliente };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.clienteService.eliminar(id).subscribe({
          next: () => {
            this.clientes = this.clientes.filter(c => c.id !== id);
            Swal.fire('Eliminado', 'Cliente eliminado correctamente.', 'success');
          },
          error: err => {
            // Opción 1: Detectar por mensaje del backend (mensaje genérico SQL)
            if (err.status === 500 && err.error?.message?.includes('foreign key constraint')) {
              Swal.fire(
                'Error',
                'No se puede eliminar el cliente porque tiene mascotas registradas.',
                'error'
              );
            }

            // Opción 2: Detectar si el backend devuelve status 409 con un mensaje claro
            else if (err.status === 409) {
              Swal.fire(
                'Error',
                err.error, // Mensaje personalizado enviado desde Spring
                'error'
              );
            }

            // Error genérico
            else {
              Swal.fire(
                'Error',
                'No se pudo eliminar el cliente. Intenta más tarde.',
                'error'
              );
            }
          }
        });
      }
    });
  }


  reset(): void {
    this.modoEditar = false;
    this.clienteEditandoId = null;
    this.nuevoCliente = this.nuevoClienteInicial();
  }

  private nuevoClienteInicial(): Cliente {
    return {
      nombres: '',
      correo: '',
      dni: ''
    };
  }
}
