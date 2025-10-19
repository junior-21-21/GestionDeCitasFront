import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CitaDTO } from '../models/cita-dto.model';
import { CitaResponseDTO } from '../models/cita-response.model';


@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private baseUrl = 'http://localhost:8080/api/citas';

  constructor(private http: HttpClient) {}

  registrarCita(cita: CitaDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}`, cita);
  }

  listarCitas(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  cambiarEstado(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/estado?estado=${estado}`, {});
  }

  listarPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/pendientes`);
  }

  listarPorVeterinario(vetId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/veterinario/${vetId}`);
  }

listarResumen(): Observable<CitaResponseDTO[]> {
  return this.http.get<CitaResponseDTO[]>(`${this.baseUrl}/resumen`);
}

editarCita(id: number, dto: CitaDTO): Observable<any> {
  return this.http.put(`${this.baseUrl}/${id}`, dto);
}

listarMascotas(): Observable<{ id: number; nombre: string }[]> {
  return this.http.get<{ id: number; nombre: string }[]>('http://localhost:8080/api/mascotas');
}

listarVeterinarios(): Observable<{ id: number; nombres: string }[]> {
  return this.http.get<{ id: number; nombres: string }[]>('http://localhost:8080/api/veterinarios');
}
}
