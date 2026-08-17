import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import Swal from 'sweetalert2';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  private isLoggingOut = false;
  private readonly public401Urls = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/usuarios/admin',
    'apisperu.com'
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocurrió un error inesperado';
        let showToast = true;

        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente (red, CORS, etc.)
          errorMessage = error.error.message;
        } else {
          // Error del lado del servidor.
          // El backend puede devolver:
          //   1. JSON con campo 'mensaje' (API propia) o 'message' (Spring default)
          //   2. String plano (ej: SalidaController retorna body(e.getMessage()))
          const serverMessage = typeof error.error === 'string'
            ? error.error
            : (error.error?.mensaje || error.error?.message);

          if (error.status === 401) {
            // 401 — sesión inválida o expirada → cerrar sesión y mostrar modal
            errorMessage = 'Sesión expirada o inválida.';
            showToast = false;
            this.handleUnauthorized(request);
          } else if (error.status === 403) {
            // 403 — usuario autenticado pero sin permisos → NO cerrar sesión.
            // El AccessDeniedHandler del backend devuelve JSON con 'mensaje'.
            errorMessage = serverMessage || 'No tienes permisos para realizar esta acción.';
          } else if (error.status === 404) {
            errorMessage = serverMessage || 'Recurso no encontrado.';
          } else if (error.status === 429) {
            errorMessage = 'Demasiados intentos. Espera unos minutos antes de reintentar.';
          } else if (error.status === 500) {
            errorMessage = serverMessage || 'Error interno del servidor.';
          } else if (error.status === 0) {
            errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión.';
          } else if (serverMessage) {
            errorMessage = serverMessage;
          }
        }

        if (showToast) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage
          });
        }

        return throwError(() => error);
      })
    );
  }

  private handleUnauthorized(request: HttpRequest<unknown>): void {
    // IMPORTANTE: capturar hadSession ANTES de llamar logout(),
    // porque logout() limpia el storage y siempre retornaría false después.
    const hadSession = !!this.authService.getToken() || !!this.authService.getUsuario();
    const isPublicRequest = this.public401Urls.some(url => request.url.includes(url));
    const isLoginRoute = this.router.url.startsWith('/login');

    // Limpiar sesión en cualquier caso
    this.authService.logout();

    // No mostrar modal si: ya estamos en login, es ruta pública,
    // no había sesión activa, o ya hay un logout en curso
    if (!hadSession || isPublicRequest || isLoginRoute || this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;

    this.router.navigate(['/login'])
      .then(() => this.showSessionExpiredAlert())
      .catch(() => { /* absorber errores de navegación */ })
      .finally(() => {
        this.isLoggingOut = false;
      });
  }

  private showSessionExpiredAlert(): void {
    Swal.fire({
      title: `
        <div style="
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: center;
        ">
          <span style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background: rgba(124, 58, 237, 0.12);
            border-radius: 12px;
            flex-shrink: 0;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </span>
          <span style="
            font-family: 'Inter', sans-serif;
            font-weight: 800;
            font-size: 1.2rem;
            color: #134E4A;
          ">Sesión Expirada</span>
        </div>
      `,
      html: `
        <p style="
          font-family: 'Inter', sans-serif;
          color: #115E59;
          font-size: 14px;
          font-weight: 500;
          margin: 0 0 16px 0;
          line-height: 1.6;
        ">
          Tu sesión ya no es válida.<br>
          Por favor, inicia sesión nuevamente.
        </p>
        <div style="
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(13, 148, 136, 0.08);
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          color: #0D9488;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Sesión vencida o inválida
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: 'Volver a ingresar',
      buttonsStyling: false,
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster'
      },
      customClass: {
        popup: 'swal-petyzoos-popup',
        confirmButton: 'swal-petyzoos-btn'
      }
    });
  }
}
