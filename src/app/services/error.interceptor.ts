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
import Swal from 'sweetalert2';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocurrió un error inesperado';
        
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
           } else if (error.status === 404) {
             errorMessage = 'Recurso no encontrado.';
           } else if (error.status === 500) {
             errorMessage = 'Error interno del servidor.';
           }
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage
        });

        return throwError(() => error);
      })
    );
  }
}
