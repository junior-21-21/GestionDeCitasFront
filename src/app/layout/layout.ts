import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Servicios
import { AuthService } from '../services/auth.service';

// SweetAlert2
import Swal from 'sweetalert2';

// Responsive
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-layout',
  standalone: true,
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class LayoutComponent {
  usuario: any;
  sidebarAbierto: boolean = true;
  esPantallaPequena: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    this.usuario = this.authService.getUsuario();

    // Detectar tamaño de pantalla
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.esPantallaPequena = result.matches;
        this.sidebarAbierto = !result.matches;
      });
  }

  toggleSidebar() {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  cerrarSidebar() {
    if (this.esPantallaPequena) {
      this.sidebarAbierto = false;
    }
  }

  logout() {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas salir?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then(result => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/login']);
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          showConfirmButton: false,
          timer: 1500
        });
      }
    });
  }

  esAdmin(): boolean {
    return this.authService.isAdmin();
  }

  esVendedor(): boolean {
    return this.authService.isVendedor();
  }
}
