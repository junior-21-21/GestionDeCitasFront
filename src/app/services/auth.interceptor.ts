import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private readonly excludedUrls = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/usuarios/admin',
    'apisperu.com'
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const shouldExclude = this.excludedUrls.some(url => req.url.includes(url));

    if (shouldExclude) {
      return next.handle(req);
    }

    // Leer el token fresco del storage en cada petición
    const token = this.authService.getToken();

    // Si el token existe pero está expirado: limpiar sesión y cancelar la petición
    if (token && this.authService.isTokenExpired(token)) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return EMPTY; // Cancela la petición en lugar de enviarla sin cabecera
    }

    // Si hay token válido, adjuntarlo
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authReq);
    }

    return next.handle(req);
  }
}
