import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Especie, Raza } from '../models/especie-raza.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EspecieRazaService {
  private baseUrl = `${environment.apiUrl}/especies`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.auth.getToken()}`
      })
    };
  }

  listarEspecies(): Observable<Especie[]> {
    return this.http.get<Especie[]>(this.baseUrl, this.getHeaders());
  }

  listarRazasPorEspecie(especieId: number): Observable<Raza[]> {
    return this.http.get<Raza[]>(`${this.baseUrl}/${especieId}/razas`, this.getHeaders());
  }

  crearEspecie(nombre: string): Observable<Especie> {
    return this.http.post<Especie>(this.baseUrl, { nombre }, this.getHeaders());
  }

  crearRaza(especieId: number, nombre: string): Observable<Raza> {
    return this.http.post<Raza>(`${this.baseUrl}/${especieId}/razas`, { nombre }, this.getHeaders());
  }
}
