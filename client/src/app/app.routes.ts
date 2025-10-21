import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component')
      .then(m => m.RegisterComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component')
      .then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
  {
    path: 'devices',
    loadComponent: () => import('./pages/devices/device-list/device-list.component')
      .then(m => m.DeviceListComponent)
  },
  {
    path: 'devices/:id',
    loadComponent: () => import('./pages/devices/device-detail/device-detail.component')
      .then(m => m.DeviceDetailComponent)
  },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/user-list/user-list.component')
          .then(m => m.UserListComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin', 'manager'] }
      },
      {
        path: 'audit',
        loadComponent: () => import('./pages/audit/audit-list/audit-list.component')
          .then(m => m.AuditListComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin', 'manager'] }
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
