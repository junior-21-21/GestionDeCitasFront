import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Especialidad } from '../models/especialidad.model';
import { AuthService } from './auth.service'; // si usas JWT

@Injectable({ providedIn: 'root' })
export class EspecialidadService {
  private baseUrl = 'http://localhost:8080/api/especialidades';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.auth.getToken()}`
      })
    };
  }

  crear(especialidad: Especialidad): Observable<Especialidad> {
    return this.http.post<Especialidad>(this.baseUrl, especialidad, this.getHeaders());
  }

  listar(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(this.baseUrl, this.getHeaders());
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.getHeaders());
  }
}
