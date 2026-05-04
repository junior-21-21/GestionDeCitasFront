import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { VentaDTO, VentaResponseDTO } from '../models/venta.model';
import { Cliente } from '../models/cliente.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VentaService {
  private url = `${environment.apiUrl}/ventas`;

  constructor(private http: HttpClient) {}

  registrarVenta(venta: VentaDTO): Observable<VentaResponseDTO> {
    return this.http.post<VentaResponseDTO>(this.url, venta);
  }

  listarVentas(): Observable<VentaResponseDTO[]> {
    return this.http.get<VentaResponseDTO[]>(this.url);
  }

  obtenerReciboPDF(codigoVenta: string): Observable<Blob> {
    const url = `${this.url}/recibo/${codigoVenta}`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
