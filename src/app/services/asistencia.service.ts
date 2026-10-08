import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  private apiUrl = environment.apiUrl + '/asistencia';
  
  private estadoTurnoSubject = new BehaviorSubject<string>('CERRADO');
  public estadoTurno$ = this.estadoTurnoSubject.asObservable();

  constructor(private http: HttpClient) {}

  verificarEstado(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/estado`).pipe(
      tap((res: any) => {
        this.estadoTurnoSubject.next(res.estado);
      })
    );
  }

  abrirTurno(): Observable<any> {
    return this.http.post(`${this.apiUrl}/abrir`, {}).pipe(
      tap(() => this.estadoTurnoSubject.next('ABIERTO'))
    );
  }

  cerrarTurno(): Observable<any> {
    return this.http.post(`${this.apiUrl}/cerrar`, {}).pipe(
      tap(() => this.estadoTurnoSubject.next('CERRADO'))
    );
  }

  // --- MÉTODOS PARA EL ADMINISTRADOR ---

  listarTodas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/todas`);
  }

  listarHorarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/horarios`);
  }

  guardarHorario(horario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/horarios`, horario);
  }

  eliminarHorario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/horarios/${id}`);
  }

  descargarPdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/horarios/pdf`, { responseType: 'blob' });
  }

  exportarAsistenciasPdf(ids: number[]): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/diarias/pdf`, { ids }, { responseType: 'blob' });
  }

  // Para obtener los empleados para asignarles horario
  listarUsuarios(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/usuarios`);
  }
}
