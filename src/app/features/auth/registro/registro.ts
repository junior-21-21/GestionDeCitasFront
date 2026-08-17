import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.scss']
})
export class RegistroComponent {
  email = '';
  password = '';
  confirmPassword = '';
  nombres = '';
  apellidos = '';
  telefono = '';
  cargando = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  registrar(): void {
    // Validaciones
    if (!this.email || !this.password || !this.nombres || !this.apellidos) {
      Swal.fire('Error', 'Todos los campos marcados son obligatorios', 'warning');
      return;
    }

    if (this.password !== this.confirmPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden', 'warning');
      return;
    }

    if (this.password.length < 6) {
      Swal.fire('Error', 'La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    this.cargando = true;

    this.authService.registroCliente({
      email: this.email,
      password: this.password,
      nombres: this.nombres,
      apellidos: this.apellidos,
      telefono: this.telefono
    }).subscribe({
      next: () => {
        this.cargando = false;
        const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        Toast.fire({ icon: 'success', title: '¡Cuenta creada! Bienvenido 🎉' });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.cargando = false;
        Swal.fire('Error', err.error?.error || 'No se pudo crear la cuenta', 'error');
      }
    });
  }
}
