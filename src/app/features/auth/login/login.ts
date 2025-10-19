import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { AuthService } from '../../../services/auth.service';
import { LoginDTO } from '../../../models/login-dto.model';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  dto: LoginDTO = { username: '', password: '' };

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    if (!this.dto.username || !this.dto.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Debe ingresar usuario y contraseña',
      });
      return;
    }

    this.authService.login(this.dto).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Bienvenido',
          text: 'Inicio de sesión exitoso',
          timer: 1500,
          showConfirmButton: false,
        });
        this.router.navigate(['/ventas']);
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Credenciales incorrectas',
          text: 'Verifique su usuario y contraseña',
        });
      }
    });
  }

  irARegistro() {
    this.router.navigate(['/registrar-admin']);
  }
}
