import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ClasificacionAbcDTO {
  codigoBarras: string;
  nombreProducto: string;
  gananciasTotales: number;
  porcentajeVentas: number;
  porcentajeAcumulado: number;
  claseABC: string;
}

export interface PedidoSugeridoDTO {
  codigoBarras: string;
  nombreProducto: string;
  stockActual: number;
  demandaDiaria: number;
  leadTime: number;
  puntoDeReorden: number;
  cantidadSugerida: number;
}

export interface AuditoriaRequestDTO {
  codigoBarras: string;
  cantidadReal: number;
  motivo: string;
  idUsuario: number;
}

@Injectable({
  providedIn: 'root'
})
export class GerencialService {
  private apiUrl = `${environment.apiUrl}/api/gerencial`;

  constructor(private http: HttpClient) {}

  getClasificacionABC(): Observable<ClasificacionAbcDTO[]> {
    return this.http.get<ClasificacionAbcDTO[]>(`${this.apiUrl}/abc`);
  }

  getPedidosSugeridos(): Observable<PedidoSugeridoDTO[]> {
    return this.http.get<PedidoSugeridoDTO[]>(`${this.apiUrl}/pedidos-sugeridos`);
  }

  registrarAuditoria(data: AuditoriaRequestDTO): Observable<{mensaje: string}> {
    return this.http.post<{mensaje: string}>(`${this.apiUrl}/auditoria`, data);
  }
}
