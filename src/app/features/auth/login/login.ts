import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AnimationService } from '../../../services/animation.service';

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
export class LoginComponent implements AfterViewInit {
  dto: LoginDTO = { email: '', password: '' };

  constructor(
    private authService: AuthService,
    private router: Router,
    private anim: AnimationService
  ) {}

  ngAfterViewInit() {
    this.anim.scaleIn('.login-card, mat-card', 100);
    this.anim.staggerIn('.mat-mdc-form-field, .login-actions', 120);
  }

  login() {
    if (!this.dto.email || !this.dto.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Debe ingresar correo electronico y contrasena',
      });
      return;
    }

    this.authService.login(this.dto).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Bienvenido',
          text: 'Inicio de sesion exitoso',
          timer: 1500,
          showConfirmButton: false,
        });
        if (this.authService.isAdmin()) {
          this.router.navigate(['/dashboard']);
        } else if (this.authService.isRecepcionista()) {
          this.router.navigate(['/clientes']);
        } else if (this.authService.isVeterinario()) {
          this.router.navigate(['/citas']);
        } else {
          this.router.navigate(['/historial-clinico']);
        }
      },
      error: (err) => {
        // Shake al formulario en cualquier error
        this.anim.shake('form, mat-card');
        const body = err.error;

        // Cuenta inhabilitada manualmente
        if (body?.error === 'CUENTA_INHABILITADA') {
          Swal.fire({
            icon: 'error',
            title: 'Cuenta Inhabilitada',
            html: `
              <p style="margin-bottom:12px">${body.mensaje}</p>
              <p style="font-size:13px;color:#64748b">
                Correo de contacto:<br>
                <strong>clinicaveterinariapetyzoos@gmail.com</strong>
              </p>
            `,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#334155'
          });
          return;
        }

        // Cuenta bloqueada por fuerza bruta
        if (body?.error === 'CUENTA_BLOQUEADA') {
          Swal.fire({
            icon: 'error',
            title: 'Cuenta Bloqueada',
            html: `
              <p style="margin-bottom:12px">${body.mensaje}</p>
              <p style="font-size:13px;color:#64748b">
                Correo de contacto:<br>
                <strong>clinicaveterinariapetyzoos@gmail.com</strong>
              </p>
            `,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#dc2626'
          });
          return;
        }

        // Credenciales incorrectas con intentos restantes
        if (body?.error === 'CREDENCIALES_INCORRECTAS') {
          const restantes = body.intentosRestantes;
          Swal.fire({
            icon: 'error',
            title: 'Credenciales incorrectas',
            html: `
              <p>Verifique su correo electronico y contrasena.</p>
              <p style="color:#dc2626;font-weight:600;margin-top:8px">
                Le quedan <strong>${restantes}</strong> intento(s) antes del bloqueo.
              </p>
            `,
          });
          return;
        }

        // Error generico
        Swal.fire({
          icon: 'error',
          title: 'Error de inicio de sesion',
          text: body?.mensaje || 'Verifique su correo electronico y contrasena',
        });
      }
    });
  }
}
