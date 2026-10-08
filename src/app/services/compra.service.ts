import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProveedorDTO {
  id?: number;
  nombre: string;
  ruc?: string;
}

export interface CompraDetalleDTO {
  producto: { id: number };
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  numeroLote?: string;
  fechaVencimiento?: string; // YYYY-MM-DD
}

export interface CompraDTO {
  id?: number;
  fechaRegistro?: string;
  numeroFactura?: string;
  proveedor?: ProveedorDTO;
  detalles: CompraDetalleDTO[];
  total?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private apiUrl = `${environment.apiUrl}/compras`;

  constructor(private http: HttpClient) {}

  registrarCompra(compra: CompraDTO): Observable<CompraDTO> {
    return this.http.post<CompraDTO>(this.apiUrl, compra);
  }

  listarCompras(): Observable<CompraDTO[]> {
    return this.http.get<CompraDTO[]>(this.apiUrl);
  }
}
