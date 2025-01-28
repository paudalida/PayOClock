import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

      if (error.error instanceof ErrorEvent) {
        // Client-side error (e.g., network failure)
        errorMessage = `Client-side error: ${error.error.message}`;
      } else {
        // Server-side error
        errorMessage = `Server error: ${error.status} - ${error.message}`;

        if (error.status === 401 || error.error?.message?.toLowerCase() === 'unauthenticated') {
          // Navigate to the login page or other appropriate route
          router.navigate(['/login']); // Replace '/login' with your desired route
        }
      }

      // Log the error to console or handle it further
      console.error(errorMessage);

      // Optionally, show a user-friendly message, log the error, or handle retries

      // Rethrow the error so it can be caught in the component or other interceptors
      return throwError(() => new Error(errorMessage));
    })
  );
};
