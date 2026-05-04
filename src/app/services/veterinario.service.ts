import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VeterinarioDTO, VeterinarioResponseDTO } from '../models/veterinario.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VeterinarioService {
  private baseUrl = `${environment.apiUrl}/veterinarios`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getAuthHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.auth.getToken()}`
    });
  }

  registrar(dto: VeterinarioDTO, foto?: File, titulo?: File): Observable<VeterinarioResponseDTO> {
    const formData = this.buildFormData(dto, foto, titulo);
    return this.http.post<VeterinarioResponseDTO>(this.baseUrl, formData, {
      headers: this.getAuthHeaders()
    });
  }

  actualizar(dni: string, dto: VeterinarioDTO, foto?: File, titulo?: File): Observable<VeterinarioResponseDTO> {
    const formData = this.buildFormData(dto, foto, titulo);
    return this.http.put<VeterinarioResponseDTO>(`${this.baseUrl}/${dni}`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  listar(): Observable<VeterinarioResponseDTO[]> {
    return this.http.get<VeterinarioResponseDTO[]>(this.baseUrl, {
      headers: this.getAuthHeaders()
    });
  }

  eliminar(dni: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${dni}`, {
      headers: this.getAuthHeaders()
    });
  }

  exportarExcel(): void {
    const headers = this.getAuthHeaders();
    this.http.get(`${this.baseUrl}/exportar-excel`, {
      headers,
      responseType: 'blob'
    }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'veterinarios.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  getArchivoUrl(filename: string): string {
    return `${this.baseUrl}/archivos/${filename}`;
  }

  obtenerPorEmail(email: string): Observable<VeterinarioResponseDTO> {
    return this.http.get<VeterinarioResponseDTO>(`${this.baseUrl}/por-email/${email}`, {
      headers: this.getAuthHeaders()
    });
  }

  private buildFormData(dto: VeterinarioDTO, foto?: File, titulo?: File): FormData {
    const formData = new FormData();

    const datosBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
    formData.append('datos', datosBlob);

    if (foto) {
      formData.append('foto', foto);
    }

    if (titulo) {
      formData.append('titulo', titulo);
    }

    return formData;
  }
}
