import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  nombreUsuario = '';
  rolClass = 'admin';
  rolBadge = '';
  saludo = '';
  mensajeRol = '';
  fechaActual = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const usuario = this.authService.getUsuario();
    this.nombreUsuario = usuario?.nombres || 'Usuario';

    const hora = new Date().getHours();
    if (hora < 12) this.saludo = 'Buenos dias';
    else if (hora < 18) this.saludo = 'Buenas tardes';
    else this.saludo = 'Buenas noches';

    this.fechaActual = new Date().toLocaleDateString('es-PE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    if (this.authService.isAdmin()) {
      this.rolClass = 'admin';
      this.rolBadge = 'Administrador';
      this.mensajeRol = 'Tienes control total del sistema. Gestiona usuarios, reportes, inventario y todas las operaciones de la Clinica Veterinaria Petyzoos.';
    } else if (this.authService.isRecepcionista()) {
      this.rolClass = 'recepcionista';
      this.rolBadge = 'Recepcionista';
      this.mensajeRol = 'Administra las citas, registra clientes y gestiona las ventas del dia. Que tengas un excelente turno en Petyzoos!';
    } else if (this.authService.isVeterinario()) {
      this.rolClass = 'veterinario';
      this.rolBadge = 'Veterinario';
      this.mensajeRol = 'Revisa las citas asignadas para hoy y atiende las consultas de tus pacientes en Petyzoos. Mucho animo, Doctor!';
    }
  }
}
