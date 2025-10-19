import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

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
        path: 'citas',
        loadComponent: () =>
          import('./features/citas/citas').then(m => m.CitasComponent)
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/clientes/clientes').then(m => m.ClientesComponent)
      },
      {
        path: 'mascotas',
        loadComponent: () =>
          import('./features/mascota/mascota').then(m => m.MascotaComponent)
      },

    {
            path: 'usuarios',
            loadComponent: () =>
              import('./features/usuario/configuracion').then(m => m.ConfiguracionComponent)
          },
      {
        path: 'especialidades',
        loadComponent: () =>
          import('./features/especialidad/especialidad').then(m => m.EspecialidadesComponent)
      },
      {
        path: 'veterinarios',
        loadComponent: () =>
          import('./features/veterinarios/veterinarios').then(m => m.VeterinariosComponent)
      },
      {
        path: 'medicamentos',
        loadComponent: () =>
          import('./features/medicamentos/medicamentos').then(m => m.MedicamentosComponent)
      },

     {
            path: 'ventas',
            loadComponent: () =>
              import('./features/venta/venta').then(m => m.VentaComponent)
          },

      // ✅ Nuevas rutas agregadas
      {
        path: 'consultas',
        loadComponent: () =>
          import('./features/consulta/consulta').then(m => m.ConsultasComponent)
      },
      {
        path: 'consultas/:id/medicamentos',
        loadComponent: () =>
          import('./features/consulta/consulta-medicamento').then(m => m.ConsultaMedicamentoComponent)
      },

      // ✅ Redirección por defecto dentro del layout
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
