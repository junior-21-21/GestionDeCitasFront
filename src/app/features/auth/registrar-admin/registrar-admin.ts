import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import Swal from 'sweetalert2';

import { UsuarioDTO } from '../../../models/usuario-dto.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-registrar-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './registrar-admin.html',
  styleUrls: ['./registrar-admin.scss']
})
export class RegistrarAdminComponent {
  dto: UsuarioDTO = {
    email: '',
    password: '',
    nombres: ''
  };

  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  registrar() {
    // Validar campos obligatorios
    const errores: string[] = [];
    if (!this.dto.nombres?.trim()) errores.push('Nombres');
    if (!this.dto.email?.trim()) errores.push('Correo Electrónico');
    if (!this.dto.password?.trim()) errores.push('Contraseña');

    if (errores.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        html: `Debes llenar los siguientes campos:<br><b>${errores.join(', ')}</b>`,
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.dto.email)) {
      Swal.fire({
        icon: 'warning',
        title: 'Correo inválido',
        text: 'Por favor ingresa un correo electrónico válido',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    // Validar longitud de contraseña
    if (this.dto.password!.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña muy corta',
        text: 'La contraseña debe tener al menos 6 caracteres',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    this.loading = true;
    this.authService.registrarAdmin(this.dto).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Administrador registrado. Se enviaron las credenciales al correo.',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          this.router.navigate(['/login']);
        });

        this.snackBar.open('Administrador registrado con éxito', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al registrar:', err);

        if (typeof err.error === 'string') {
          this.error = err.error;
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.message) {
          this.error = err.message;
        } else {
          this.error = 'Error desconocido al registrar administrador';
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.error,
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  irALogin() {
    this.router.navigate(['/login']);
  }
}
