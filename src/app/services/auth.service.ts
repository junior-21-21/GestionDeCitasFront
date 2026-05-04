import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginDTO } from '../models/login-dto.model';
import { UsuarioDTO } from '../models/usuario-dto.model';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { LoginResponse } from '../models/login-response.model';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly loginUrl = `${this.apiUrl}/auth/login`;
  private readonly usuariosUrl = `${this.apiUrl}/usuarios`;

  private readonly tokenKey = 'auth-token';
  private readonly userKey = 'auth-user';

  // BehaviorSubject para cambios reactivos de imagen de perfil
  private imagenPerfilSubject = new BehaviorSubject<string | null>(null);
  imagenPerfil$ = this.imagenPerfilSubject.asObservable();

  // BehaviorSubject para cambios reactivos de datos del usuario
  private usuarioSubject = new BehaviorSubject<LoginResponse | null>(null);
  usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) {
    // Inicializar con datos guardados
    const usuario = this.getUsuario();
    this.usuarioSubject.next(usuario);
    if (usuario?.id) {
      const img = localStorage.getItem('perfil-imagen-' + usuario.id);
      this.imagenPerfilSubject.next(img);
    }
  }

  login(dto: LoginDTO): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, dto).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res));
        this.usuarioSubject.next(res);
      })
    );
  }

  registrarAdmin(dto: UsuarioDTO): Observable<any> {
    return this.http.post<any>(`${this.usuariosUrl}/admin`, dto);
  }

  registrarRecepcionista(dto: UsuarioDTO): Observable<any> {
    return this.http.post<any>(`${this.usuariosUrl}/vendedor`, dto);
  }

  crearUsuario(dto: UsuarioDTO): Observable<any> {
    return this.http.post<any>(`${this.usuariosUrl}/crear`, dto);
  }

  // --- CRUD USUARIOS ---

  listarUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.usuariosUrl);
  }

  actualizarUsuario(id: number, usuario: UsuarioDTO): Observable<any> {
    return this.http.put(`${this.usuariosUrl}/${id}`, usuario);
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.usuariosUrl}/${id}`);
  }

  cambiarPassword(id: number, password: string): Observable<any> {
    return this.http.put(`${this.usuariosUrl}/${id}/password`, { password }, { responseType: 'text' });
  }

  actualizarImagen(id: number, imagen: string): Observable<any> {
    return this.http.put(`${this.usuariosUrl}/${id}/imagen`, { imagen }, { responseType: 'text' }).pipe(
      tap(() => {
        // Notificar reactivamente a todos los suscriptores
        localStorage.setItem('perfil-imagen-' + id, imagen);
        this.imagenPerfilSubject.next(imagen);
      })
    );
  }

  obtenerImagen(id: number): Observable<any> {
    return this.http.get(`${this.usuariosUrl}/${id}/imagen`);
  }

  desbloquearCuenta(id: number): Observable<any> {
    return this.http.put(`${this.usuariosUrl}/${id}/desbloquear`, {}, { responseType: 'text' });
  }

  cambiarEstadoCuenta(id: number, estado: boolean): Observable<any> {
    return this.http.put(`${this.usuariosUrl}/${id}/estado`, { estado }, { responseType: 'text' });
  }

  // --- ACTUALIZAR DATOS DEL USUARIO EN CACHE ---

  actualizarUsuarioLocal(datos: Partial<LoginResponse>): void {
    const actual = this.getUsuario();
    if (actual) {
      const actualizado = { ...actual, ...datos };
      localStorage.setItem(this.userKey, JSON.stringify(actualizado));
      this.usuarioSubject.next(actualizado);
    }
  }

  actualizarImagenLocal(imagen: string): void {
    const usuario = this.getUsuario();
    if (usuario?.id) {
      localStorage.setItem('perfil-imagen-' + usuario.id, imagen);
      this.imagenPerfilSubject.next(imagen);
    }
  }

  // --- AUTENTICACION ---

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUsuario(): LoginResponse | null {
    const data = localStorage.getItem(this.userKey);
    return data ? JSON.parse(data) : null;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.usuarioSubject.next(null);
    this.imagenPerfilSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(rol: 'ADMIN' | 'RECEPCIONISTA' | 'VETERINARIO'): boolean {
    const usuario = this.getUsuario();
    return (usuario?.rol === rol);
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isRecepcionista(): boolean {
    return this.hasRole('RECEPCIONISTA');
  }

  isVeterinario(): boolean {
    return this.hasRole('VETERINARIO');
  }
}
