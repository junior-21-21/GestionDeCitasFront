import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioDTO } from '../../models/usuario-dto.model';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../environments/environment';

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
  rolesDisponibles = ['ADMIN', 'RECEPCIONISTA', 'VETERINARIO'];

  // Estado del formulario
  usuarioSeleccionado: UsuarioDTO = {
    email: '',
    password: '',
    nombres: '',
    rol: 'RECEPCIONISTA' // Rol por defecto
  };

  modoEdicion = false;
  modalVisible = false; // Controla la visibilidad del formulario (o modal)
  
  // Cambio de contraseña
  passwordModalVisible = false;
  newPassword = '';
  usuarioPasswordId: number | undefined;

  // Visibilidad de contraseñas
  mostrarPassNuevo = false;
  mostrarPassCambio = false;

  archivoSeleccionado: File | null = null;

  constructor(private authService: AuthService, private router: Router) {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.authService.listarUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (e) => console.error('Error al cargar usuarios', e)
    });
  }

  formatImageUrl(url: string | null): string | null {
    if (url && url.startsWith('/api')) {
      return environment.apiUrl.replace('/api', '') + url;
    }
    return url;
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.archivoSeleccionado = event.target.files[0];
    }
  }

  abrirCrear() {
    this.modoEdicion = false;
    this.usuarioSeleccionado = { email: '', password: '', nombres: '', apellidos: '', rol: 'RECEPCIONISTA' };
    this.archivoSeleccionado = null;
    this.modalVisible = true;
  }

  abrirEditar(u: any) {
    this.modoEdicion = true;
    this.usuarioSeleccionado = { 
        id: u.id,
        email: u.email,
        nombres: u.nombres,
        apellidos: u.apellidos,
        rol: u.rol ? (u.rol.nombre || u.rol) : ''
    };
    this.archivoSeleccionado = null;
    this.modalVisible = true;
  }

  guardarUsuario() {
    if (this.modoEdicion) {
      if(!this.usuarioSeleccionado.id) return;
      this.authService.actualizarUsuario(this.usuarioSeleccionado.id, this.usuarioSeleccionado).subscribe({
        next: () => {
          if (this.archivoSeleccionado) {
            this.subirFoto(this.usuarioSeleccionado.id!, 'Usuario actualizado correctamente');
          } else {
            Swal.fire('Actualizado', 'Usuario actualizado correctamente', 'success');
            this.modalVisible = false;
            this.cargarUsuarios();
          }
        },
        error: () => Swal.fire('Error', 'No se pudo actualizar', 'error')
      });
    } else {
      if (!this.usuarioSeleccionado.nombres?.trim() || 
          !this.usuarioSeleccionado.email?.trim() || 
          !this.usuarioSeleccionado.password?.trim()) {
        Swal.fire('Campos incompletos', 'Debes llenar todos los campos para crear un usuario', 'warning');
        return;
      }

      this.authService.crearUsuario(this.usuarioSeleccionado).subscribe({
        next: (nuevoUsuario: any) => {
          if (this.archivoSeleccionado && nuevoUsuario && nuevoUsuario.id) {
            this.subirFoto(nuevoUsuario.id, 'Usuario creado correctamente. Se enviaron las credenciales al correo.');
          } else {
            Swal.fire('Creado', 'Usuario creado correctamente. Se enviaron las credenciales al correo.', 'success');
            this.modalVisible = false;
            this.cargarUsuarios();
          }
        },
        error: (err) => {
          let msg = typeof err.error === 'string' ? err.error : 
                    (err.error?.text || err.error?.message || 'No se pudo crear el usuario');
          Swal.fire('Error', msg, 'error');
        }
      });
    }
  }

  subirFoto(usuarioId: number, mensajeExito: string) {
    this.authService.actualizarImagen(usuarioId, this.archivoSeleccionado!).subscribe({
      next: () => {
        Swal.fire('Éxito', mensajeExito + ' (Foto subida)', 'success');
        this.modalVisible = false;
        this.cargarUsuarios();
      },
      error: () => {
        Swal.fire('Advertencia', mensajeExito + ', pero hubo un problema al subir la foto.', 'warning');
        this.modalVisible = false;
        this.cargarUsuarios();
      }
    });
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
          error: (err) => {
              console.error('SERVER ERROR:', err);
              // Si falla al parsear un texto plano como JSON, err.error.text tiene el string
              let msg = typeof err.error === 'string' ? err.error : 
                        (err.error?.text || err.error?.message || err.message || 'Error al cambiar contraseña.');
              if (msg === 'Http failure during parsing for http://localhost:8080/api/usuarios/1/password' && err.error?.text) {
                  msg = err.error.text;
              }
              Swal.fire('Error', msg, 'error');
          }
      });
  }

  desbloquearUsuario(u: any) {
    Swal.fire({
      title: '¿Desbloquear cuenta?',
      text: `Se desbloqueará la cuenta de ${u.nombres}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, desbloquear',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.desbloquearCuenta(u.id).subscribe({
            next: () => {
                Swal.fire('Desbloqueado', 'La cuenta ha sido desbloqueada', 'success');
                this.cargarUsuarios();
            },
            error: (err) => {
                const msg = typeof err.error === 'string' ? err.error : 'No se pudo desbloquear la cuenta';
                Swal.fire('Error', msg, 'error');
            }
        });
      }
    });
  }

  cambiarEstado(u: any) {
    // Si no viene en el backend, por defecto será true
    const estadoActual = u.habilitada !== false;
    const nuevoEstado = !estadoActual;
    const accion = nuevoEstado ? 'habilitar' : 'inhabilitar';
    
    Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} cuenta?`,
      text: `Se va a ${accion} la cuenta de ${u.nombres}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.cambiarEstadoCuenta(u.id, nuevoEstado).subscribe({
            next: () => {
                Swal.fire('Éxito', `La cuenta ha sido ${nuevoEstado ? 'habilitada' : 'inhabilitada'}`, 'success');
                this.cargarUsuarios();
            },
            error: (err) => {
                const msg = typeof err.error === 'string' ? err.error : `No se pudo ${accion} la cuenta`;
                Swal.fire('Error', msg, 'error');
            }
        });
      }
    });
  }
}
