import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DetalleVenta {
  producto: { id: number; nombre?: string; precioVenta?: number };
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
  id?: number;
  fecha?: string;
  total?: number;
  clienteNombre?: string;
  clienteDni?: string;
  detalles: DetalleVenta[];
}

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private url = `${environment.apiUrl}/api/ventas`;

  constructor(private http: HttpClient) {}

  listarVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.url);
  }

  registrarVenta(venta: Venta): Observable<Venta> {
    return this.http.post<Venta>(this.url, venta);
  }
}
