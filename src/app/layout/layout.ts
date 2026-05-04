import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

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
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
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
export class LayoutComponent implements OnInit, OnDestroy {
  
  // Referencia al componente visual del Sidebar para poder abrirlo/cerrarlo
  @ViewChild('sidenav') sidenav!: MatSidenav;

  usuario: any;
  rolLabel: string = '';
  imagenPerfil: string | null = null;

  // Estado del sidebar: por defecto colapsado (solo iconos)
  isCollapsed: boolean = true;
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.usuario = this.authService.getUsuario();
    this.imagenPerfil = this.usuario ? localStorage.getItem('perfil-imagen-' + this.usuario.id) : null;

    // Determinar el label del rol
    if (this.authService.isAdmin()) {
      this.rolLabel = 'Administrador';
    } else if (this.authService.isRecepcionista()) {
      this.rolLabel = 'Recepcionista';
    } else if (this.authService.isVeterinario()) {
      this.rolLabel = 'Veterinario';
    }
  }

  ngOnInit(): void {
    // Cargar imagen desde backend al iniciar (persistencia produccion)
    if (this.usuario?.id) {
      this.authService.obtenerImagen(this.usuario.id).subscribe({
        next: (res: any) => {
          if (res?.imagen) {
            this.authService.actualizarImagenLocal(res.imagen);
          }
        }
      });
    }

    // Suscripción reactiva a cambios de imagen (reemplaza polling con setInterval)
    this.subscriptions.push(
      this.authService.imagenPerfil$.subscribe(img => {
        this.imagenPerfil = img;
      })
    );

    // Suscripción reactiva a cambios del usuario
    this.subscriptions.push(
      this.authService.usuario$.subscribe(user => {
        if (user) {
          this.usuario = user;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      reverseButtons: true
    }).then(result => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/login']);
        
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

  esAdmin(): boolean {
    return this.authService.isAdmin();
  }

  esVeterinario(): boolean {
    return this.authService.isVeterinario();
  }

  esRecepcionista(): boolean {
    return this.authService.isRecepcionista();
  }
}