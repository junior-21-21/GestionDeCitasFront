import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioDTO } from '../../models/usuario-dto.model';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.scss']
})
export class ConfiguracionComponent {
  // Lista de usuarios y roles
  usuarios: any[] = []; // Se recomienda usar una interfaz UsuarioResponse
  rolesDisponibles = ['ADMIN', 'VENDEDOR', 'VETERINARIO'];

  // Estado del formulario
  usuarioSeleccionado: UsuarioDTO = {
    username: '',
    password: '',
    nombres: '',
    roles: ['VENDEDOR'] // Rol por defecto
  };

  modoEdicion = false;
  modalVisible = false; // Controla la visibilidad del formulario (o modal)
  
  // Cambio de contraseña
  passwordModalVisible = false;
  newPassword = '';
  usuarioPasswordId: number | undefined;

  constructor(private authService: AuthService, private router: Router) {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    // Necesitamos un método en AuthService o UsuarioService para listar
    // Si no existe en AuthService, lo agregaremos.
    // Por ahora asumimos que authService tiene listarUsuarios (o creamos UsuarioService frontend)
    this.authService.listarUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (e) => console.error('Error al cargar usuarios', e)
    });
  }

  abrirCrear() {
    this.modoEdicion = false;
    this.usuarioSeleccionado = { username: '', password: '', nombres: '', roles: ['VENDEDOR'] };
    this.modalVisible = true;
  }

  abrirEditar(u: any) {
    this.modoEdicion = true;
    // Copia profunda para no mutar la tabla directamente
    this.usuarioSeleccionado = { 
        id: u.id,
        username: u.username,
        nombres: u.nombres,
        // Adaptar roles si vienen como objetos
        roles: u.roles ? u.roles.map((r: any) => r.nombre) : []
    };
    this.modalVisible = true;
  }

  guardarUsuario() {
    if (this.modoEdicion) {
      if(!this.usuarioSeleccionado.id) return;
      this.authService.actualizarUsuario(this.usuarioSeleccionado.id, this.usuarioSeleccionado).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'Usuario actualizado correctamente', 'success');
          this.modalVisible = false;
          this.cargarUsuarios();
        },
        error: () => Swal.fire('Error', 'No se pudo actualizar', 'error')
      });
    } else {
      // Crear
      // Dependiendo del rol, llamamos a registrarAdmin o registrarVendedor, 
      // o usamos un endpoint genérico si el backend lo soporta.
      // Por simplicidad, usaremos 'registrarVendedor' si es vendedor, o lógica especial.
      // MEJOR: El backend 'registrarVendedor' asigna rol VENDEDOR automaticamente.
      // Si queremos flexibilidad total, necesitamos un endpoint 'crearUsuario' que reciba roles.
      // Por ahora usaremos registrarVendedor como base.
      
      this.authService.registrarVendedor(this.usuarioSeleccionado).subscribe({
        next: () => {
          Swal.fire('Creado', 'Usuario creado correctamente', 'success');
          this.modalVisible = false;
          this.cargarUsuarios();
        },
        error: () => Swal.fire('Error', 'No se pudo crear', 'error')
      });
    }
  }

  eliminarUsuario(u: any) {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: `Se eliminará a ${u.nombres}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.eliminarUsuario(u.id).subscribe({
            next: () => {
                Swal.fire('Eliminado', 'Usuario eliminado', 'success');
                this.cargarUsuarios();
            },
            error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }
  
  // --- PASSWORD ---
  abrirCambiarPassword(u: any) {
      this.usuarioPasswordId = u.id;
      this.newPassword = '';
      this.passwordModalVisible = true;
  }
  
  guardarPassword() {
      if(!this.usuarioPasswordId || !this.newPassword) return;
      
      this.authService.cambiarPassword(this.usuarioPasswordId, this.newPassword).subscribe({
          next: () => {
              Swal.fire('Éxito', 'Contraseña actualizada', 'success');
              this.passwordModalVisible = false;
          },
          error: () => Swal.fire('Error', 'No se pudo cambiar la contraseña', 'error')
      });
  }
}
