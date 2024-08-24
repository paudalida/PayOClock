import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PopupService } from '../popup/popup.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private pop: PopupService,
  ) { }
  
  private domain = 'http://localhost:8000/';
  private apiUrl = 'http://localhost:8000/api/';
  private userType = '';

  public get getUserType() {
    return this.userType;
  }

  public getCookie() {
    return this.http.get(this.domain + 'sanctum/csrf-cookie', { withCredentials: true });
  }

  public login(type: string, form: any): Observable<boolean> {
    return this.http.post(this.apiUrl + 'auth/login/' + type, form, { withCredentials: true }).pipe(
      map((res: any) => {
        // Store session data
        sessionStorage.setItem('name', res.data.name);
        sessionStorage.setItem('position', res.data.position);
        this.userType = type;

        // Show success toast
        this.pop.toastWithTimer('success', res.message);
        return true; // Indicate success
      }),
      catchError((err: any) => {
        // Handle error responses
        switch (err.error.message) {
          case 'Failed to fetch':
            this.pop.swalBasic('error', 'Login Error', 'Could not contact server, please try again later');
            break;
          case 'Invalid credentials':
            this.pop.swalBasic('error', 'Login Error', 'Invalid username or password');
            break;
          default:
            this.pop.swalBasic('error', this.pop.genericErrorTitle, this.pop.genericErrorMessage);
            break;
        }

        return of(false); // Return false for failed login
      })
    );
  }  
}