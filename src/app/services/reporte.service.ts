import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) { }

  exportarClientes(): void {
    this.http.get(`${this.apiUrl}/exportar-clientes`, { responseType: 'blob' })
      .subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'clientes.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      }, error => {
        console.error('Error al descargar el reporte de clientes', error);
      });
  }

  exportarPacientes(): void {
    this.http.get(`${this.apiUrl}/exportar-pacientes`, { responseType: 'blob' })
      .subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pacientes.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      }, error => {
        console.error('Error al descargar el reporte de pacientes', error);
      });
  }

  getTotalVentas(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/total-ventas`);
  }

  getVentasPorFecha(inicio: string, fin: string): Observable<any[]> {
    let params = new HttpParams().set('inicio', inicio).set('fin', fin);
    return this.http.get<any[]>(`${this.apiUrl}/ventas-por-fecha`, { params });
  }

  getProductosMasVendidos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/productos-mas-vendidos`);
  }

  getEspeciesMasAtendidas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/especies-mas-atendidas`);
  }
}
