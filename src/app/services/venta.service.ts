import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { VentaDTO, VentaResponseDTO } from '../models/venta.model';
import { Medicamento } from '../models/medicamento.model';
import { Cliente } from '../models/cliente.model';

@Injectable({
  providedIn: 'root',
})
export class VentaService {
  private url = 'http://localhost:8080/api/ventas';

  constructor(private http: HttpClient) {}

  registrarVenta(venta: VentaDTO): Observable<VentaResponseDTO> {
    return this.http.post<VentaResponseDTO>(this.url, venta);
  }

  listarVentas(): Observable<VentaResponseDTO[]> {
    return this.http.get<VentaResponseDTO[]>(this.url);
  }

  obtenerReciboPDF(idVenta: number): Observable<Blob> {
    const url = `${this.url}/recibo/${idVenta}`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
