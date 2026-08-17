import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  citas: number;
  consultas: number;
  pacientes: number;
  topEspecies: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(periodo: string = 'hoy'): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats?periodo=${periodo}`);
  }
}
