import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const RoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si no hay una sesion valida, redirigir al login antes de cargar datos protegidos.
  if (!authService.hasValidSession()) {
    return router.createUrlTree(['/login']);
  }

  // Obtener los roles permitidos para la ruta desde la propiedad 'data'
  const expectedRoles: string[] = route.data?.['roles'] || [];

  // Si no se especificaron roles (ruta pública dentro de sesión), permitir
  if (expectedRoles.length === 0) {
    return true;
  }

  // Verificar si el usuario actual tiene alguno de los roles esperados
  const tieneRolPermitido = expectedRoles.some(rol => {
    // castear a cualquiera de los roles literales permitidos por el servicio
    return authService.hasRole(rol as any);
  });

  if (tieneRolPermitido) {
    return true;
  }

  // Si no tiene el rol, redirigir a la pantalla de Acceso Denegado
  return router.createUrlTree(['/no-acceso']);
};
