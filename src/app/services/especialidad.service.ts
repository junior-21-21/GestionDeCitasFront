import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Especialidad } from '../models/especialidad.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {
  private baseUrl = `${environment.apiUrl}/especialidades`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(this.baseUrl);
  }

  crear(especialidad: Especialidad): Observable<Especialidad> {
    return this.http.post<Especialidad>(this.baseUrl, especialidad);
  }

  actualizar(id: number, especialidad: Especialidad): Observable<Especialidad> {
    return this.http.put<Especialidad>(`${this.baseUrl}/${id}`, especialidad);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
