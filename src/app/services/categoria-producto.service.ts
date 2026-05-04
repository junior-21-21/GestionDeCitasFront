import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CategoriaProductoDTO } from '../models/categoria-producto.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriaProductoService {
  private apiUrl = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<CategoriaProductoDTO[]> {
    return this.http.get<CategoriaProductoDTO[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<CategoriaProductoDTO> {
    return this.http.get<CategoriaProductoDTO>(`${this.apiUrl}/${id}`);
  }

  crear(categoria: CategoriaProductoDTO): Observable<CategoriaProductoDTO> {
    return this.http.post<CategoriaProductoDTO>(this.apiUrl, categoria);
  }

  actualizar(id: number, categoria: CategoriaProductoDTO): Observable<CategoriaProductoDTO> {
    return this.http.put<CategoriaProductoDTO>(`${this.apiUrl}/${id}`, categoria);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
