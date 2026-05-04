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
          // Client-side error
          errorMessage = error.error.message;
        } else {
          // Server-side error
           if(error.error && error.error.message){
              errorMessage = error.error.message;
           } else if (error.status === 403) {
             errorMessage = 'No tienes permisos para realizar esta acción.';
           } else if (error.status === 401) {
             errorMessage = 'Sesión expirada o inválida.';
             showToast = false;

             // Auto-logout en producción: limpiar sesión y redirigir
             if (!this.isLoggingOut) {
               this.isLoggingOut = true;
               this.authService.logout();
               this.router.navigate(['/login']).then(() => {
                 this.isLoggingOut = false;
                 Swal.fire({
                   icon: 'warning',
                   title: 'Sesión expirada',
                   text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
                   confirmButtonColor: '#4f46e5'
                 });
               });
             }
           } else if (error.status === 404) {
             errorMessage = 'Recurso no encontrado.';
           } else if (error.status === 429) {
             errorMessage = 'Demasiados intentos. Espera unos minutos antes de reintentar.';
           } else if (error.status === 500) {
             errorMessage = 'Error interno del servidor.';
           } else if (error.status === 0) {
             errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión.';
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
}
