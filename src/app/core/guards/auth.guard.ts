import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Chưa đăng nhập → về `location.origin` (app SMAX chính); localhost không redirect được → trang 404 hiện `authError`.
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (auth.isLoggedIn()) return true;
  return auth.redirectToLogin() ? false : inject(Router).createUrlTree(['/404']);
};
