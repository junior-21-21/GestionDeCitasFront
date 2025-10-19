import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginDTO } from '../models/login-dto.model';
import { UsuarioDTO } from '../models/usuario-dto.model';
import { Observable, tap } from 'rxjs';
import { LoginResponse } from '../models/login-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loginUrl = 'http://localhost:8080/api/auth/login';
  private registerUrl = 'http://localhost:8080/api/usuarios/admin';
  private vendedorUrl = 'http://localhost:8080/api/usuarios/vendedor';

  private tokenKey = 'auth-token';
  private userKey = 'auth-user';

  constructor(private http: HttpClient) {}

  login(dto: LoginDTO): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, dto).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res));
      })
    );
  }

  registrarAdmin(dto: UsuarioDTO): Observable<any> {
    return this.http.post<any>(this.registerUrl, dto);
  }

  registrarVendedor(dto: UsuarioDTO): Observable<any> {
    return this.http.post<any>(this.vendedorUrl, dto);
  }

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
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(rol: 'ADMIN' | 'VENDEDOR'): boolean {
    const usuario = this.getUsuario();
    return usuario?.roles?.some(r => r.nombre === rol) ?? false;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isVendedor(): boolean {
    return this.hasRole('VENDEDOR');
  }
}
