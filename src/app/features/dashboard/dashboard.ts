import { Component, OnInit, AfterViewInit, QueryList, ElementRef, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardStats } from './dashboard.service';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  fechaActual: Date = new Date();
  usuario: any = null;
  rolLabel: string = 'ADMINISTRADOR';

  periodoSeleccionado: string = 'hoy';
  stats: DashboardStats | null = null;
  loadingStats: boolean = true;

  @ViewChildren('statNumber') statNumbers!: QueryList<ElementRef>;

  constructor(
    private dashboardService: DashboardService,
    private anim: AnimationService
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      try {
        this.usuario = JSON.parse(userStr);
        if (this.usuario.roles && this.usuario.roles.length > 0) {
          const role = this.usuario.roles[0].nombre;
          if (role === 'ROLE_ADMIN') this.rolLabel = 'ADMINISTRADOR';
          else if (role === 'ROLE_RECEPCIONISTA') this.rolLabel = 'RECEPCIONISTA';
          else if (role === 'ROLE_VETERINARIO') this.rolLabel = 'VETERINARIO';
        }
      } catch (e) {
        console.error('Error parseando usuario', e);
      }
    }
    this.cargarEstadisticas();
  }

  ngAfterViewInit() {
    // Animar banner de bienvenida
    this.anim.welcomeBanner('.welcome-banner', '.welcome-content', '.welcome-illustration img');
  }

  cambiarPeriodo(periodo: string) {
    this.periodoSeleccionado = periodo;
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.loadingStats = true;
    this.dashboardService.getStats(this.periodoSeleccionado).subscribe({
      next: (data) => {
        this.stats = data;
        this.loadingStats = false;
        // Tras renderizar las tarjetas, animarlas
        setTimeout(() => this.animarStats(), 50);
      },
      error: (err) => {
        console.error('Error al cargar estadisticas', err);
        this.loadingStats = false;
      }
    });
  }

  private animarStats() {
    // Cards en stagger
    this.anim.staggerIn('.stat-card', 100);
    // Counter-up en cada número
    setTimeout(() => {
      this.statNumbers.forEach(ref => {
        const val = parseInt(ref.nativeElement.getAttribute('data-value') || '0', 10);
        if (!isNaN(val)) this.anim.countUp(ref.nativeElement, val, 1000);
      });
    }, 300);
  }

  getTopEspeciesKeys(): string[] {
    if (!this.stats || !this.stats.topEspecies) return [];
    return Object.keys(this.stats.topEspecies);
  }
}
