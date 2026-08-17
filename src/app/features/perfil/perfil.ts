import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.scss']
})
export class PerfilComponent implements OnInit {
  usuario: any;
  nombres: string = '';
  apellidos: string = '';
  email: string = '';
  rolLabel: string = '';
  inicialNombre: string = 'U';
  imagenPerfil: string | null = null;

  // Password
  passwordNuevo: string = '';
  passwordConfirm: string = '';
  mostrarPassNuevo: boolean = false;
  mostrarPassConfirm: boolean = false;

  // Password strength
  fuerzaPassword: number = 0;
  textoFuerza: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuario();
    if (this.usuario) {
      this.nombres = this.usuario.nombres || '';
      this.apellidos = this.usuario.apellidos || '';
      this.email = this.usuario.email || '';
      this.inicialNombre = this.nombres.charAt(0).toUpperCase();

      if (this.authService.isAdmin()) {
        this.rolLabel = 'Administrador';
      } else if (this.authService.isRecepcionista()) {
        this.rolLabel = 'Recepcionista';
      } else if (this.authService.isVeterinario()) {
        this.rolLabel = 'Veterinario';
      }

      // Obtener la imagen
      const cachedImage = localStorage.getItem('perfil-imagen-' + this.usuario.id);
      if (cachedImage) {
        this.imagenPerfil = this.formatImageUrl(cachedImage);
      } else if (this.usuario.fotoUrl) {
        this.imagenPerfil = this.formatImageUrl(this.usuario.fotoUrl);
      }
    }

    // Sincronizar con backend
    this.authService.obtenerImagen(this.usuario.id).subscribe({
      next: (res: any) => {
        if (res?.imagen) {
          this.imagenPerfil = this.formatImageUrl(res.imagen);
          localStorage.setItem('perfil-imagen-' + this.usuario.id, res.imagen);
        }
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (file.size > 2 * 1024 * 1024) {
        Swal.fire('Error', 'La imagen no debe superar los 2MB', 'error');
        return;
      }

      // Subir al backend
      this.authService.actualizarImagen(this.usuario.id, file).subscribe({
        next: (res) => {
          this.imagenPerfil = this.formatImageUrl(res.url);
          Swal.fire({
            icon: 'success',
            title: 'Foto actualizada',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo subir la foto', 'error');
        }
      });
    }
  }

  formatImageUrl(url: string): string {
    if (url && url.startsWith('/api')) {
      return environment.apiUrl.replace('/api', '') + url;
    }
    return url;
  }

  guardarDatos(): void {
    if (!this.nombres.trim()) {
      Swal.fire('Error', 'El nombre no puede estar vacio', 'error');
      return;
    }

    const dto = {
      nombres: this.nombres,
      apellidos: this.apellidos,
      email: this.email,
      password: ''
    };

    this.authService.actualizarUsuario(this.usuario.id, dto).subscribe({
      next: () => {
        const stored = this.authService.getUsuario();
        if (stored) {
          stored.nombres = this.nombres;
          stored.apellidos = this.apellidos;
          localStorage.setItem('auth-user', JSON.stringify(stored));
          this.usuario = stored;
          this.inicialNombre = this.nombres.charAt(0).toUpperCase();
        }

        Swal.fire({
          icon: 'success',
          title: 'Datos actualizados',
          text: 'Tu perfil ha sido actualizado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: () => {
        Swal.fire('Error', 'No se pudo actualizar el perfil', 'error');
      }
    });
  }

  evaluarFuerza(pass: string): void {
    if (!pass) {
      this.fuerzaPassword = 0;
      this.textoFuerza = '';
      return;
    }

    let fuerza = 0;
    const tieneMinuscula = /[a-z]/.test(pass);
    const tieneMayuscula = /[A-Z]/.test(pass);
    const tieneNumero = /\d/.test(pass);
    const tieneEspecial = /[!@#$%^&*?_~\-,.()]/.test(pass);

    const requerimientosBasicos = pass.length >= 6 && tieneMinuscula && tieneMayuscula && tieneNumero;

    if (requerimientosBasicos) {
      if (pass.length >= 8 && tieneEspecial) {
        fuerza = 3; // Fuerte
      } else {
        fuerza = 2; // Media
      }
    } else {
      fuerza = 1; // Débil
    }

    this.fuerzaPassword = fuerza;
    const textos = ['', 'Tu contrasena es debil', 'Tu contrasena es media', 'Tu contrasena es fuerte'];
    this.textoFuerza = textos[fuerza];
  }

  cambiarPassword(): void {
    if (!this.passwordNuevo || !this.passwordConfirm) {
      Swal.fire('Error', 'Debes completar todos los campos', 'error');
      return;
    }

    if (this.passwordNuevo !== this.passwordConfirm) {
      Swal.fire('Error', 'Las contrasenas no coinciden', 'error');
      return;
    }

    if (this.passwordNuevo.length < 6) {
      Swal.fire('Error', 'La contrasena debe tener al menos 6 caracteres', 'error');
      return;
    }

    if (!/[A-Z]/.test(this.passwordNuevo)) {
      Swal.fire('Error', 'La contrasena debe tener al menos una letra mayuscula', 'error');
      return;
    }

    if (!/[a-z]/.test(this.passwordNuevo)) {
      Swal.fire('Error', 'La contrasena debe tener al menos una letra minuscula', 'error');
      return;
    }

    if (!/\d/.test(this.passwordNuevo)) {
      Swal.fire('Error', 'La contrasena debe tener al menos un numero', 'error');
      return;
    }

    this.authService.cambiarPassword(this.usuario.id, this.passwordNuevo).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Contrasena actualizada',
          timer: 2000,
          showConfirmButton: false
        });
        this.passwordNuevo = '';
        this.passwordConfirm = '';
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cambiar la contrasena', 'error');
      }
    });
  }
}
