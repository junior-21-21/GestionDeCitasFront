import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginDTO } from '../models/login-dto.model';
import { UsuarioDTO } from '../models/usuario-dto.model';
import { RegistroClienteDTO } from '../models/registro-cliente.model';
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

  // Previene llamadas re-entrantes a logout() desde hasValidSession()
  private isLoggingOut = false;

  // BehaviorSubject para cambios reactivos de imagen de perfil
  private imagenPerfilSubject = new BehaviorSubject<string | null>(null);
  imagenPerfil$ = this.imagenPerfilSubject.asObservable();

  // BehaviorSubject para cambios reactivos de datos del usuario
  private usuarioSubject = new BehaviorSubject<LoginResponse | null>(null);
  usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) {
    this.clearInvalidSession();

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

  registroCliente(dto: RegistroClienteDTO): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/registro`, dto).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res));
        this.usuarioSubject.next(res);
      })
    );
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

  actualizarImagen(id: number, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', archivo);

    return this.http.post<any>(`${this.usuariosUrl}/foto/${id}`, formData).pipe(
      tap((res) => {
        // Notificar reactivamente a todos los suscriptores
        const imagenUrl = res.url;
        localStorage.setItem('perfil-imagen-' + id, imagenUrl);
        this.imagenPerfilSubject.next(imagenUrl);
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
    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data);
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }

  /**
   * Cierre de sesión completo:
   * 1. Elimina token y usuario del localStorage
   * 2. Borra todas las entradas de imagen de perfil (perfil-imagen-*)
   * 3. Limpia sessionStorage
   * 4. Resetea los BehaviorSubjects reactivos
   * El flag isLoggingOut evita re-entradas desde hasValidSession()
   */
  logout(): void {
    if (this.isLoggingOut) return;
    this.isLoggingOut = true;

    try {
      // 1. Eliminar claves conocidas
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);

      // 2. Eliminar todas las imágenes de perfil cacheadas
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('perfil-imagen-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // 3. Purgar sessionStorage
      sessionStorage.clear();

      // 4. Resetear estado reactivo
      this.usuarioSubject.next(null);
      this.imagenPerfilSubject.next(null);
    } finally {
      this.isLoggingOut = false;
    }
  }

  isAuthenticated(): boolean {
    return this.hasValidSession();
  }

  hasValidSession(): boolean {
    // Evitar re-entrada durante un logout en curso
    if (this.isLoggingOut) return false;

    const token = this.getToken();
    const usuario = this.getUsuario();

    if (!token || !usuario || this.isTokenExpired(token)) {
      this.logout();
      return false;
    }

    return true;
  }

  clearInvalidSession(): boolean {
    const token = this.getToken();
    const usuario = this.getUsuario();

    if ((!token && usuario) || (token && this.isTokenExpired(token))) {
      this.logout();
      return true;
    }

    return false;
  }

  isTokenExpired(token: string | null = this.getToken()): boolean {
    if (!token) {
      return true;
    }

    try {
      const payloadSegment = token.split('.')[1];
      if (!payloadSegment) {
        return true;
      }

      const payload = JSON.parse(atob(this.toBase64(payloadSegment)));
      if (typeof payload.exp !== 'number') {
        return true;
      }

      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  hasRole(rol: 'ADMIN' | 'RECEPCIONISTA' | 'VETERINARIO' | 'CLIENTE'): boolean {
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

  isCliente(): boolean {
    return this.hasRole('CLIENTE');
  }

  private toBase64(base64Url: string): string {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    return padding ? base64 + '='.repeat(4 - padding) : base64;
  }
}
