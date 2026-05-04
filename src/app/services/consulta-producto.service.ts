import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ConsultaProductoDTO, ConsultaProductoResponse } from '../models/consulta.model';

@Injectable({
  providedIn: 'root'
})
export class ConsultaProductoService {
  private apiUrl = `${environment.apiUrl}/consultas`;

  constructor(private http: HttpClient) {}

  agregarProducto(dto: ConsultaProductoDTO): Observable<ConsultaProductoResponse> {
    return this.http.post<ConsultaProductoResponse>(`${this.apiUrl}/producto`, dto);
  }

  obtenerProductosPorConsulta(codigoConsulta: string): Observable<ConsultaProductoResponse[]> {
    return this.http.get<ConsultaProductoResponse[]>(`${this.apiUrl}/${codigoConsulta}/productos`);
  }
}
