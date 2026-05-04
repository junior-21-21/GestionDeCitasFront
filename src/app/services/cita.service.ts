import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CitaDTO } from '../models/cita-dto.model';
import { CitaResponseDTO } from '../models/cita-response.model';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private baseUrl = `${environment.apiUrl}/citas`;

  constructor(private http: HttpClient) {}

  registrarCita(cita: CitaDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}`, cita);
  }

  listarCitas(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  cambiarEstado(codigoCita: string, estado: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${codigoCita}/estado?estado=${estado}`, {});
  }

  listarPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/pendientes`);
  }

  listarPorVeterinario(vetDni: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/veterinario/${vetDni}`);
  }

  listarResumen(): Observable<CitaResponseDTO[]> {
    return this.http.get<CitaResponseDTO[]>(`${this.baseUrl}/resumen`);
  }

  listarResumenPorVeterinario(dni: string): Observable<CitaResponseDTO[]> {
    return this.http.get<CitaResponseDTO[]>(`${this.baseUrl}/resumen/veterinario/${dni}`);
  }

  editarCita(codigoCita: string, dto: CitaDTO): Observable<any> {
    return this.http.put(`${this.baseUrl}/${codigoCita}`, dto);
  }

  listarPacientes(): Observable<{ codigoPaciente: string; nombre: string }[]> {
    return this.http.get<{ codigoPaciente: string; nombre: string }[]>(`${environment.apiUrl}/pacientes`);
  }

  listarVeterinarios(): Observable<{ dni: string; nombres: string }[]> {
    return this.http.get<{ dni: string; nombres: string }[]>(`${environment.apiUrl}/veterinarios`);
  }

  descargarComprobante(codigoCita: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/reportes/cita/${codigoCita}/pdf`, { responseType: 'blob' });
  }

  eliminarCita(codigoCita: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${codigoCita}`);
  }

  obtenerPorCodigo(codigoCita: string): Observable<CitaResponseDTO> {
    return this.http.get<CitaResponseDTO>(`${this.baseUrl}/${codigoCita}`);
  }
}
