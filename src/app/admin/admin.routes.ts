import { Routes } from '@angular/router';

// TODO(phase-5+): add users, customers, roles, settings routes as those features are built.
export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.AdminDashboard),
  },
];
