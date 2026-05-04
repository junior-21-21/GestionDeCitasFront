import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoteDTO } from '../models/lote.model';
import { MovimientoInventarioDTO, MovimientoInventarioResponseDTO } from '../models/movimiento-inventario.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = `${environment.apiUrl}/api/inventario`;

  constructor(private http: HttpClient) {}

  registrarEntrada(usuarioId: number, codigoBarras: string, lote: LoteDTO): Observable<any> {
    const params = new HttpParams()
      .set('usuarioId', usuarioId.toString())
      .set('codigoBarras', codigoBarras);
    return this.http.post<any>(`${this.apiUrl}/entrada`, lote, { params });
  }

  obtenerLotesDisponibles(codigoBarras: string): Observable<LoteDTO[]> {
    return this.http.get<LoteDTO[]>(`${this.apiUrl}/lotes/disponibles/${codigoBarras}`);
  }

  obtenerHistorialMovimientos(codigoBarras: string): Observable<MovimientoInventarioResponseDTO[]> {
    return this.http.get<MovimientoInventarioResponseDTO[]>(`${this.apiUrl}/movimientos/${codigoBarras}`);
  }

  obtenerLibroEstupefacientes(): Observable<MovimientoInventarioResponseDTO[]> {
    return this.http.get<MovimientoInventarioResponseDTO[]>(`${this.apiUrl}/movimientos/controlados`);
  }

  ajustarInventario(usuarioId: number, codigoBarras: string, cantidad: number, motivo: string, tipoMovimiento: string, loteId?: number): Observable<any> {
    let params = new HttpParams()
      .set('usuarioId', usuarioId.toString())
      .set('codigoBarras', codigoBarras)
      .set('cantidad', cantidad.toString())
      .set('motivo', motivo)
      .set('tipoMovimiento', tipoMovimiento);

    if (loteId) {
      params = params.set('loteId', loteId.toString());
    }

    return this.http.post<any>(`${this.apiUrl}/ajuste`, {}, { params });
  }
}
