import { Component, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Módulos de Angular Material necesarios
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

// Servicios
import { AuthService } from '../services/auth.service';

// Utilidades
import Swal from 'sweetalert2';
import { SpinnerComponent } from '../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  templateUrl: './layout.html', // Asegúrate de que coincida con tu archivo HTML
  styleUrls: ['./layout.scss'], // Asegúrate de que coincida con tu archivo SCSS
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    SpinnerComponent
  ]
})
export class LayoutComponent {
  
  // Referencia al componente visual del Sidebar para poder abrirlo/cerrarlo
  @ViewChild('sidenav') sidenav!: MatSidenav;

  usuario: any;

  // Estado del sidebar: por defecto colapsado (solo iconos)
  isCollapsed: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Obtenemos la información del usuario logueado al iniciar
    this.usuario = this.authService.getUsuario();
  }

  // Método para alternar entre expandido y colapsado
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  // Lógica de cierre de sesión con confirmación
  logout() {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas salir?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33', // Rojo para acción destructiva
      cancelButtonColor: '#3085d6', // Azul para cancelar
      reverseButtons: true // Pone el botón de cancelar a la izquierda (mejor UX)
    }).then(result => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/login']);
        
        // Pequeña notificación toast (opcional)
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000
        });
        Toast.fire({
            icon: 'success',
            title: 'Sesión cerrada'
        });
      }
    });
  }

  // Verificar si es administrador para mostrar opciones extra
  esAdmin(): boolean {
    return this.authService.isAdmin();
  }
}