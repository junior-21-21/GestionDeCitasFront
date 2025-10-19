import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente, ClienteResponseDTO } from '../models/cliente.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private baseUrl = 'http://localhost:8080/api/clientes';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.authService.getToken()}`
      })
    };
  }

  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.baseUrl, this.getHeaders());
  }

  crear(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.baseUrl, cliente, this.getHeaders());
  }

  obtener(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${id}`, this.getHeaders());
  }

  actualizar(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/${id}`, cliente, this.getHeaders());
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.getHeaders());
  }

  // ✅ Método que te faltaba
  buscarPorDni(dni: string): Observable<ClienteResponseDTO> {
    return this.http.get<ClienteResponseDTO>(`${this.baseUrl}/por-dni/${dni}`, this.getHeaders());
  }

  buscarPorId(id: number): Observable<ClienteResponseDTO> {
    return this.http.get<ClienteResponseDTO>(`${this.baseUrl}/${id}`, this.getHeaders());
  }
}
