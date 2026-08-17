import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PacienteDTO, PacienteResponseDTO, Paciente } from '../models/mascota.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MascotaService {
  private baseUrl = `${environment.apiUrl}/pacientes`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.auth.getToken()}`
      })
    };
  }

  registrar(dto: PacienteDTO): Observable<PacienteResponseDTO> {
    return this.http.post<PacienteResponseDTO>(this.baseUrl, dto, this.getHeaders());
  }


  listarTodas(): Observable<PacienteResponseDTO[]> {
    return this.http.get<PacienteResponseDTO[]>(this.baseUrl, this.getHeaders());
  }

  listarPorCliente(clienteDni: string): Observable<PacienteResponseDTO[]> {
    return this.http.get<PacienteResponseDTO[]>(`${this.baseUrl}/cliente/${clienteDni}`, this.getHeaders());
  }

  buscarPorNombre(nombre: string): Observable<PacienteResponseDTO[]> {
    return this.http.get<PacienteResponseDTO[]>(`${this.baseUrl}/por-nombre/${nombre}`, this.getHeaders());
  }

  buscarPorDni(dni: string): Observable<PacienteResponseDTO[]> {
    return this.http.get<PacienteResponseDTO[]>(`${this.baseUrl}/por-dni/${dni}`, this.getHeaders());
  }

  eliminar(codigoPaciente: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${codigoPaciente}`, this.getHeaders());
  }

  actualizar(codigoPaciente: string, paciente: PacienteDTO): Observable<PacienteResponseDTO> {
    return this.http.put<PacienteResponseDTO>(`${this.baseUrl}/${codigoPaciente}`, paciente, this.getHeaders());
  }

  buscarPorCodigo(codigo: string): Observable<PacienteResponseDTO> {
    return this.http.get<PacienteResponseDTO>(`${this.baseUrl}/${codigo}`, this.getHeaders());
  }

  descargarCredencialPdf(codigoPaciente: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${codigoPaciente}/credencial/pdf`, {
      headers: this.getHeaders().headers,
      responseType: 'blob'
    });
  }

  subirFoto(codigoPaciente: string, file: File): Observable<{url: string}> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{url: string}>(`${this.baseUrl}/foto/${codigoPaciente}`, formData, this.getHeaders());
  }
}
