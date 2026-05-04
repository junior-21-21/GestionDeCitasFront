import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProductoDTO } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(this.apiUrl);
  }

  obtenerPorCodigo(codigoBarras: string): Observable<ProductoDTO> {
    return this.http.get<ProductoDTO>(`${this.apiUrl}/${codigoBarras}`);
  }

  crear(producto: ProductoDTO): Observable<ProductoDTO> {
    return this.http.post<ProductoDTO>(this.apiUrl, producto);
  }

  actualizar(codigoBarras: string, producto: ProductoDTO): Observable<ProductoDTO> {
    return this.http.put<ProductoDTO>(`${this.apiUrl}/${codigoBarras}`, producto);
  }

  eliminar(codigoBarras: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${codigoBarras}`);
  }
}
