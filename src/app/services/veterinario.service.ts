import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VeterinarioDTO, VeterinarioResponseDTO } from '../models/veterinario.model';
import { AuthService } from './auth.service'; // si estás usando tokens

@Injectable({ providedIn: 'root' })
export class VeterinarioService {
  private baseUrl = 'http://localhost:8080/api/veterinarios';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.auth.getToken()}`
      })
    };
  }

  registrar(dto: VeterinarioDTO): Observable<VeterinarioResponseDTO> {
    return this.http.post<VeterinarioResponseDTO>(this.baseUrl, dto, this.getHeaders());
  }

  listar(): Observable<VeterinarioResponseDTO[]> {
    return this.http.get<VeterinarioResponseDTO[]>(this.baseUrl, this.getHeaders());
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.getHeaders());
  }

actualizar(id: number, dto: VeterinarioDTO): Observable<VeterinarioResponseDTO> {
  return this.http.put<VeterinarioResponseDTO>(`${this.baseUrl}/${id}`, dto, this.getHeaders());
}

}
