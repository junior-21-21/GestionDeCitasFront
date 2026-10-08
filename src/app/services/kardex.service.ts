import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProductoDTO } from '../models/producto.model';

export interface KardexDTO {
  id?: number;
  fechaHora: string;
  tipoOperacion: 'INGRESO' | 'VENTA' | 'CONSUMO_INTERNO' | 'AJUSTE';
  detalle: string;
  cantidad: number;
  saldoResultante: number;
}

@Injectable({
  providedIn: 'root'
})
export class KardexService {
  private apiUrl = `${environment.apiUrl}/kardex`;

  constructor(private http: HttpClient) {}

  obtenerHistorialPorProducto(productoId: number): Observable<KardexDTO[]> {
    return this.http.get<KardexDTO[]>(`${this.apiUrl}/producto/${productoId}`);
  }
}
