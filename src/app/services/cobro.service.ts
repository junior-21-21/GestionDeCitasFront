import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CobroConsulta {
  id?: number;
  fecha?: string;
  total: number;
  estado?: string;
  detalleCargos: string;
  consulta?: {
    codigoConsulta: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CobroConsultaService {
  private apiUrl = `${environment.apiUrl}/cobros`;

  constructor(private http: HttpClient) {}

  registrarCobro(codigoConsulta: string, cobro: CobroConsulta): Observable<CobroConsulta> {
    return this.http.post<CobroConsulta>(`${this.apiUrl}/consulta/${codigoConsulta}`, cobro);
  }

  obtenerCobro(codigoConsulta: string): Observable<CobroConsulta> {
    return this.http.get<CobroConsulta>(`${this.apiUrl}/consulta/${codigoConsulta}`);
  }

  listarPendientes(): Observable<CobroConsulta[]> {
    return this.http.get<CobroConsulta[]>(`${this.apiUrl}/pendientes`);
  }

  pagarCobro(id: number): Observable<CobroConsulta> {
    return this.http.post<CobroConsulta>(`${this.apiUrl}/${id}/pagar`, {});
  }
}
