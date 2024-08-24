import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { lastValueFrom } from 'rxjs';

export const canActivateChildGuard: CanActivateChildFn = async (childRoute, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  let userType = authService.getUserType;

  if (!userType) {
    try {
      // Use lastValueFrom to wait for the Observable to resolve
      const res: any = await lastValueFrom(authService.requestUserType());

      userType = res.data;

      if (userType && state.url.includes(userType)) {
        return true; // Allow access
      } else {
        await router.navigate(['/not-found']); // Navigate to "not-found" page
        return false; // Deny access
      }
    } catch (error) {
      await router.navigate(['/not-found']); // Handle error
      return false;
    }
  } else if (state.url.includes(userType)) {
    return true; // Allow access
  } else {
    await router.navigate(['/not-found']); // Navigate to "not-found" page
    return false; // Deny access
  }
};
