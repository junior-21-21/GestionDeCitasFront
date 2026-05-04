import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente, ClienteResponseDTO } from '../models/cliente.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private baseUrl = `${environment.apiUrl}/clientes`;

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

  obtener(dni: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${dni}`, this.getHeaders());
  }

  actualizar(dni: string, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/${dni}`, cliente, this.getHeaders());
  }

  eliminar(dni: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${dni}`, this.getHeaders());
  }

  buscarPorDni(dni: string): Observable<ClienteResponseDTO> {
    return this.http.get<ClienteResponseDTO>(`${this.baseUrl}/${dni}`, this.getHeaders());
  }

  buscarPorDniParcial(dni: string): Observable<ClienteResponseDTO[]> {
    return this.http.get<ClienteResponseDTO[]>(`${this.baseUrl}/buscar/${dni}`, this.getHeaders());
  }
}
