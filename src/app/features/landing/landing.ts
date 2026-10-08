import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class LandingComponent implements AfterViewInit {
  codigoBusqueda: string = '';
  cargando: boolean = false;
  mascotaEncontrada: boolean = false;
  error: string | null = null;
  historialConsultas: any[] = [];
  pacienteInfo: any = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      const elements = document.querySelectorAll('.scroll-animate, .stagger-item');
      elements.forEach(el => observer.observe(el));
    }
  }

  buscarHistorial(): void {
    if (!this.codigoBusqueda) return;
    
    this.cargando = true;
    this.error = null;
    this.mascotaEncontrada = false;
    this.historialConsultas = [];
    this.pacienteInfo = null;

    // Primero verificamos el paciente para obtener su nombre (opcional) y luego su historial
    this.http.get<any>(`${environment.apiUrl}/pacientes/public/${this.codigoBusqueda.toUpperCase()}`).subscribe({
      next: (paciente) => {
        this.pacienteInfo = paciente;
        this.mascotaEncontrada = true;
        
        // Obtener historial
        this.http.get<any[]>(`${environment.apiUrl}/consultas/historial/public/paciente/${this.codigoBusqueda.toUpperCase()}`).subscribe({
          next: (historial) => {
            this.historialConsultas = historial || [];
            this.cargando = false;
          },
          error: (err) => {
            this.cargando = false;
            // No history is fine, just empty array
          }
        });
      },
      error: (err) => {
        this.cargando = false;
        if (err.status === 404 || err.status === 403 || err.status === 500) {
          this.error = 'No se encontró ninguna mascota con ese código.';
        } else {
          this.error = 'Ocurrió un error al buscar. Inténtalo de nuevo.';
        }
      }
    });
  }

  descargarHistorialPdf(): void {
    if (!this.codigoBusqueda) return;
    
    const url = `${environment.apiUrl}/consultas/historial/public/paciente/${this.codigoBusqueda.toUpperCase()}/pdf`;
    
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const fileUrl = window.URL.createObjectURL(blob);
        window.open(fileUrl, '_blank');
      },
      error: () => {
        this.error = 'Error al descargar el PDF. Es posible que la mascota aún no tenga historial clínico.';
        this.mascotaEncontrada = false;
      }
    });
  }
}

