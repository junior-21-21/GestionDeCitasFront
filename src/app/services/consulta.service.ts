import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Consulta, ConsultaDTO } from '../models/consulta.model';
import { ConsultaResponse } from '../models/consulta-response.model';
import { ConsultaProductoResponse } from '../models/consulta.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  private url = `${environment.apiUrl}/consultas`;

  constructor(private http: HttpClient) {}

  registrarConsulta(dto: ConsultaDTO): Observable<Consulta> {
    return this.http.post<Consulta>(this.url, dto);
  }

  listarConsultas(): Observable<ConsultaResponse[]> {
    return this.http.get<ConsultaResponse[]>(this.url);
  }

  buscarPorCodigo(codigoConsulta: string): Observable<Consulta> {
    return this.http.get<Consulta>(`${this.url}/${codigoConsulta}`);
  }

  obtenerProductosPorConsulta(codigoConsulta: string): Observable<ConsultaProductoResponse[]> {
    return this.http.get<ConsultaProductoResponse[]>(`${this.url}/${codigoConsulta}/productos`);
  }

  buscarPorDni(dni: string): Observable<ConsultaResponse[]> {
    return this.http.get<ConsultaResponse[]>(`${this.url}/por-dni/${dni}`);
  }

  obtenerHistorialPorPaciente(codigoPaciente: string): Observable<ConsultaResponse[]> {
    return this.http.get<ConsultaResponse[]>(`${this.url}/historial/paciente/${codigoPaciente}`);
  }

  listarConsultasHoy(): Observable<ConsultaResponse[]> {
    return this.http.get<ConsultaResponse[]>(`${this.url}/hoy`);
  }

  descargarRecetaPdf(codigoConsulta: string): Observable<Blob> {
    return this.http.get(`${this.url}/${codigoConsulta}/receta/pdf`, {
      responseType: 'blob'
    });
  }
}
