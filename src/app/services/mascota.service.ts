import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MascotaDTO, MascotaResponseDTO, Mascota } from '../models/mascota.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class MascotaService {
  private baseUrl = 'http://localhost:8080/api/mascotas';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.auth.getToken()}`
      })
    };
  }

  registrar(dto: MascotaDTO): Observable<MascotaResponseDTO> {
    return this.http.post<MascotaResponseDTO>(this.baseUrl, dto, this.getHeaders());
  }

  listar(): Observable<Mascota[]> {
    return this.http.get<Mascota[]>(this.baseUrl, this.getHeaders());
  }

  listarTodas(): Observable<MascotaResponseDTO[]> {
    return this.http.get<MascotaResponseDTO[]>(this.baseUrl, this.getHeaders());
  }

  listarPorCliente(clienteId: number): Observable<MascotaResponseDTO[]> {
    return this.http.get<MascotaResponseDTO[]>(`${this.baseUrl}/cliente/${clienteId}`, this.getHeaders());
  }

  buscarPorNombre(nombre: string): Observable<MascotaResponseDTO[]> {
    return this.http.get<MascotaResponseDTO[]>(`${this.baseUrl}/por-nombre/${nombre}`, this.getHeaders());
  }

  // ✅ Nueva función para buscar por DNI
  buscarPorDni(dni: string): Observable<MascotaResponseDTO[]> {
    return this.http.get<MascotaResponseDTO[]>(`${this.baseUrl}/por-dni/${dni}`, this.getHeaders());
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.getHeaders());
  }

  actualizar(id: number, mascota: MascotaDTO): Observable<MascotaResponseDTO> {
    return this.http.put<MascotaResponseDTO>(`${this.baseUrl}/${id}`, mascota, this.getHeaders());
  }
}
