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
      const res: any = await lastValueFrom(authService.requestUserType());

      userType = res?.data;

      if (!userType) {
        await router.navigate(['/not-found']);
        return false;
      }
    } catch (error) {
      return false;
    }
  } else {
    console.log('UserType found:', userType);
  }

  // After resolving userType, check URL match
  if (state.url.includes(userType)) {
    return true;
  } else {
    await router.navigate(['/not-found']);
    return false;
  }
};
