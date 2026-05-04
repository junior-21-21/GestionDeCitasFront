import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
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
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout').then(m => m.LayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
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
        data: { roles: ['ADMIN', 'RECEPCIONISTA', 'VETERINARIO'] }
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/clientes/clientes').then(m => m.ClientesComponent),
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
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/productos/productos.component').then(m => m.ProductosComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'RECEPCIONISTA'] }
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/categorias/categorias').then(m => m.CategoriasComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },

     {
            path: 'ventas',
            loadComponent: () =>
              import('./features/venta/venta').then(m => m.VentaComponent),
            canActivate: [RoleGuard],
            data: { roles: ['ADMIN', 'RECEPCIONISTA'] }
          },

      // ✅ Nuevas rutas agregadas
      {
        path: 'consultas',
        loadComponent: () =>
          import('./features/consulta/consulta').then(m => m.ConsultasComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'RECEPCIONISTA', 'VETERINARIO'] }
      },
      {
        path: 'consultas/:id/productos',
        loadComponent: () =>
          import('./features/consulta/consulta-medicamento').then(m => m.ConsultaMedicamentoComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'RECEPCIONISTA', 'VETERINARIO'] }
      },
      {
        path: 'historial-clinico',
        loadComponent: () =>
          import('./features/historial-clinico/historial-clinico').then(m => m.HistorialClinicoComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'RECEPCIONISTA', 'VETERINARIO'] }
      },
      {
        path: 'estupefacientes',
        loadComponent: () =>
          import('./features/estupefacientes/estupefacientes').then(m => m.EstupefacientesComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'VETERINARIO'] }
      },
      {
        path: 'no-acceso',
        loadComponent: () =>
          import('./features/auth/no-acceso/no-acceso').then(m => m.NoAccesoComponent)
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./features/reportes/reportes').then(m => m.ReportesComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
