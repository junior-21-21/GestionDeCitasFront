import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  // ══════════════════════════════════════════
  // AUTH PÚBLICO
  // ══════════════════════════════════════════
  {
    path: 'registro',
    loadComponent: () =>
      import('./features/auth/registro/registro').then(m => m.RegistroComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'registrar-admin',
    loadComponent: () =>
      import('./features/auth/registrar-admin/registrar-admin').then(m => m.RegistrarAdminComponent)
  },

  // ══════════════════════════════════════════
  // PANEL ADMINISTRATIVO (protegido)
  // ══════════════════════════════════════════
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout').then(m => m.LayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },

      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/perfil/perfil').then(m => m.PerfilComponent)
      },
      {
        path: 'citas',
        loadComponent: () =>
          import('./features/citas/citas').then(m => m.CitasComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'VETERINARIO'] }
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/clientes/clientes').then(m => m.ClientesComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'RECEPCIONISTA'] }
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/inventario/categorias/categorias').then(m => m.CategoriasComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/inventario/productos/productos').then(m => m.ProductosComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'RECEPCIONISTA'] }
      },
      {
        path: 'mascotas',
        loadComponent: () =>
          import('./features/mascota/mascota').then(m => m.MascotaComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'RECEPCIONISTA'] }
      },

    {
            path: 'usuarios',
            loadComponent: () =>
              import('./features/usuario/configuracion').then(m => m.ConfiguracionComponent),
            canActivate: [RoleGuard],
            data: { roles: ['ADMIN'] } // SOLO ADMIN PUEDE VER USUARIOS
          },
      {
        path: 'especialidades',
        loadComponent: () =>
          import('./features/especialidad/especialidad').then(m => m.EspecialidadesComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'veterinarios',
        loadComponent: () =>
          import('./features/veterinarios/veterinarios').then(m => m.VeterinariosComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'RECEPCIONISTA'] }
      },

      // ✅ Nuevas rutas agregadas
      {
        path: 'consultas',
        loadComponent: () =>
          import('./features/consulta/consulta').then(m => m.ConsultasComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'VETERINARIO'] }
      },

      {
        path: 'historial-clinico',
        loadComponent: () =>
          import('./features/historial-clinico/historial-clinico').then(m => m.HistorialClinicoComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'RECEPCIONISTA', 'VETERINARIO'] }
      },

      {
        path: 'configuracion-entorno',
        loadComponent: () =>
          import('./features/configuracion-entorno/configuracion-entorno').then(m => m.ConfiguracionEntornoComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'no-acceso',
        loadComponent: () =>
          import('./features/auth/no-acceso/no-acceso').then(m => m.NoAccesoComponent)
      },


      {
        path: '',
        redirectTo: 'historial-clinico',
        pathMatch: 'full'
      },
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ]
  },

  // ══════════════════════════════════════════
  // RUTA RAÍZ → LOGIN
  // ══════════════════════════════════════════
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
