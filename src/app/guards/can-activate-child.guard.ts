import { inject, ɵbypassSanitizationTrustResourceUrl } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const canActivateChildGuard: CanActivateChildFn = (childRoute, state) => {
  const as = inject(AuthService);
  const userType = as.getUserType;
  const router = inject(Router);

  if(userType && state.url.includes(userType)) { return true; }
  else { router.navigate(['/not-found']); return false; };
};