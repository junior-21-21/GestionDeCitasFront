import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Medicamento, MedicamentoDTO } from '../models/medicamento.model';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // si usas JWT

@Injectable({ providedIn: 'root' })
export class MedicamentoService {
  private baseUrl = 'http://localhost:8080/api/medicamentos';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.auth.getToken()}`
      })
    };
  }

  listar(): Observable<Medicamento[]> {
    return this.http.get<Medicamento[]>(this.baseUrl, this.getHeaders());
  }

  crear(med: MedicamentoDTO): Observable<Medicamento> {
    return this.http.post<Medicamento>(this.baseUrl, med, this.getHeaders());
  }

  actualizar(id: number, med: MedicamentoDTO): Observable<Medicamento> {
    return this.http.put<Medicamento>(`${this.baseUrl}/${id}`, med, this.getHeaders());
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.getHeaders());
  }

  obtenerPorId(id: number): Observable<Medicamento> {
    return this.http.get<Medicamento>(`${this.baseUrl}/${id}`, this.getHeaders());
  }
}
