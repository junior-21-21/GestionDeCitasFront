import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si hay token
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  // Verificar si el token JWT ha expirado
  const token = authService.getToken();
  if (token && isTokenExpired(token)) {
    authService.logout();
    return router.createUrlTree(['/login']);
  }

  return true;
};

/**
 * Decodifica el payload del JWT y verifica si ha expirado.
 * Retorna true si el token ha expirado o es inválido.
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expMs = payload.exp * 1000; // JWT exp es en segundos
    return Date.now() >= expMs;
  } catch {
    return true; // Token malformado = expirado
  }
}
