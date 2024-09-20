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
      const res: any = await authService.requestUserDetails();

      if(res){
        userType = authService.getUserType;
      } else {
        await router.navigate(['./landing']);
        return false;
      }
    } catch (err: any) {
      if(err.error) {
        if(err.error.message.toLowerCase().includes('unauthenticated')) { await router.navigate(['./landing']); }
      }
      
      return false;
    }
  }

  /* After resolving userType, check URL match */
  if (state.url.includes(userType)) {
    return true;
  } else {
    await router.navigate(['./landing']);
    return false;
  }
};
