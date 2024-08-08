import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { PopupService } from '../popup/popup.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private pop: PopupService
  ) { }
  
  private apiUrl = 'http://localhost:8000/api/';

  public login(type: string, form: any): Observable<boolean> {
    return this.http.post(this.apiUrl + 'auth/login/' + type, form).pipe(
      map((res: any) => {
        // Handle successful response
        sessionStorage.setItem('name', res.data.name);
        sessionStorage.setItem('position', res.data.position);
        sessionStorage.setItem('api-token', res.data.token);

        this.pop.toastWithTimer('success', 'Logged in successfully!');
        return true; // Return true for successful login
      }),
      catchError((err: any) => {
        // Handle error response
        switch(err.error.message) {
          case 'Failed to fetch':
            this.pop.swalBasic('error', 'Login Error', 'Could not contact server, please try again later');
            break;

          case 'Invalid credentials':
            this.pop.swalBasic('error', 'Login Error', 'Invalid username or password');
            break;

          default:
            this.pop.swalBasic('error', 'Unknown Error', 'Please contact the developers');
            break;
        }

        return of(false); // Return false for failed login
      })
    );
  }
}
