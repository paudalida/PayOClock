import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  try {
    const authToken = sessionStorage.getItem('auth-token');

    // Clone the request and add the Authorization header if the token exists
    const authReq = authToken
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${authToken}`
          }
        })
      : req;

    // Pass the modified request to the next handler
    return next(authReq);
  } catch (error) {
    throw new Error('Unauthenticated');
  }
};
