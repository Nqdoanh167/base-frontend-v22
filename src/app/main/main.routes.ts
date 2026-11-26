import { Routes } from '@angular/router';

export const MAIN_ROUTES: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./home/home').then((m) => m.Home),
  },
];
