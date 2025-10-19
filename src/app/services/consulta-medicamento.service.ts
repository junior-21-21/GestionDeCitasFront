import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConsultaMedicamentoDTO, ConsultaMedicamentoResponse } from '../models/consulta.model';

@Injectable({ providedIn: 'root' })
export class ConsultaMedicamentoService {
  private baseUrl = 'http://localhost:8080/api/consultas';

  constructor(private http: HttpClient) {}

  registrar(dto: ConsultaMedicamentoDTO): Observable<ConsultaMedicamentoResponse> {
    return this.http.post<ConsultaMedicamentoResponse>(`${this.baseUrl}/medicamento`, dto);
  }

  listarMedicamentosPorConsulta(consultaId: number): Observable<ConsultaMedicamentoResponse[]> {
    return this.http.get<ConsultaMedicamentoResponse[]>(`${this.baseUrl}/${consultaId}/medicamentos`);
  }
}
