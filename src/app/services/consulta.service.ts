import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Consulta, ConsultaDTO } from '../models/consulta.model';
import { ConsultaResponse } from '../models/consulta-response.model';
import { ConsultaMedicamentoResponse } from '../models/consulta.model'; // ✅ IMPORTAR INTERFAZ

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  private url = 'http://localhost:8080/api/consultas';

  constructor(private http: HttpClient) {}

  registrarConsulta(dto: ConsultaDTO): Observable<Consulta> {
    return this.http.post<Consulta>(this.url, dto);
  }

  listarConsultas(): Observable<ConsultaResponse[]> {
    return this.http.get<ConsultaResponse[]>(this.url);
  }

  buscarPorId(id: number): Observable<Consulta> {
    return this.http.get<Consulta>(`${this.url}/${id}`);
  }

  // ✅ CORREGIDO: usar this.url en lugar de cadena fija
  obtenerMedicamentosPorConsulta(consultaId: number): Observable<ConsultaMedicamentoResponse[]> {
    return this.http.get<ConsultaMedicamentoResponse[]>(`${this.url}/${consultaId}/medicamentos`);
  }

  buscarPorDni(dni: string): Observable<ConsultaResponse[]> {
    return this.http.get<ConsultaResponse[]>(`${this.url}/por-dni/${dni}`);
  }

  obtenerHistorialPorMascota(mascotaId: number): Observable<ConsultaResponse[]> {
    return this.http.get<ConsultaResponse[]>(`${this.url}/historial/mascota/${mascotaId}`);
  }
}
