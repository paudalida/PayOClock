import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PopupService } from '../popup/popup.service';
import { HttpHeaders } from '@angular/common/http';
import { DataService } from '../data/data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private pop: PopupService,
    private ds: DataService
  ) { }
  
  private apiUrl = 'http://localhost:8000/api/';
  private userType = '';
  private headers = new HttpHeaders({
    'Authorization': `Bearer ${sessionStorage.getItem('auth-token') || ''}`
  });

  public get getUserType() {
    return this.userType;
  }

  public set setUserType(data: string) {
    this.userType = data;
  }

  public requestUserType() {
    return this.http.post(this.apiUrl + 'auth/user', { }, { headers: this.headers });
  }

  public login(type: string, form: any): Observable<boolean> {
    return this.http.post(this.apiUrl + 'auth/login/' + type, form, { withCredentials: true }).pipe(
      map((res: any) => {
        // Store session data
        sessionStorage.setItem('name', res.data.name);
        sessionStorage.setItem('position', res.data.position);
        sessionStorage.setItem('auth-token', res.data.token);
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