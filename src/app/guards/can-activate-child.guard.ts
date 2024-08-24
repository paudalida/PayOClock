import { CanActivateChildFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const canActivateChildGuard: CanActivateChildFn = async (childRoute, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const userType = authService.getUserType;

  if (userType && state.url.includes(userType)) {
    return true; // Allow access
  } else {
    await router.navigate(['/not-found']); // Navigate to "not-found" page
    return false; // Deny access
  }
}
