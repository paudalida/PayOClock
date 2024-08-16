import { inject, ɵbypassSanitizationTrustResourceUrl } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const canActivateChildGuard: CanActivateChildFn = (childRoute, state) => {
  const as = inject(AuthService);
  const userType = as.getUserType;

  if(userType && state.url.includes(userType)) { return true; }
  else { return false; };
};