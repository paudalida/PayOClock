import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PopupService } from '../popup/popup.service';
import { Router } from '@angular/router';
import { HeaderService } from '../header/header.service';
import { EmployeeService } from '../employee/employee.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private pop: PopupService,
    private router: Router,
    private es: EmployeeService,
    private header: HeaderService
  ) { }
  
  // private apiUrl = 'http://localhost:8000/api/';
  private apiUrl = 'http://26.68.32.39:8000/api/';
  private userType = '';

  public get getUserType() {
    return this.userType;
  }

  public set setUserType(data: string) {
    this.userType = data;
  }

  public requestUserDetails() {
    return new Promise((resolve, reject) => {
      return this.http.post(this.apiUrl + 'auth/user', {}, {headers: this.header.authHeader}).subscribe({
        next: (res: any) => {
          this.userType = res.data.type;
          this.es.setEmployee(res.data.details);
          resolve(true);
        },
        error: (err: any) => {
          resolve(false);
        }
      });
    });
  }

  public login(type: string, form: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl + 'auth/login/' + type, form).subscribe({
        next: (res: any) => {
          // Store session data
          sessionStorage.setItem('name', res.data.name);
          sessionStorage.setItem('position', res.data.position);
          sessionStorage.setItem('auth-token', res.data.token);
          this.es.setEmployee(res.data.user);
          this.userType = type;
  
          // Show success toast
          this.pop.toastWithTimer('success', res.message);
          this.router.navigate([type]);
  
          // Resolve true on success
          resolve(true);
        },
        error: (err: any) => {
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
  
          // Resolve false on failure
          resolve(false);
        }
      });
    });
  }
  
  public logout() {
    this.http.post(this.apiUrl + 'auth/logout', null, { headers: this.header.authHeader }).subscribe({
      next: (res: any) => {
        this.router.navigate(['../login/' + this.userType]);
        sessionStorage.clear();
        this.pop.toastWithTimer('success', res.message);
      },
      error: (err: any) => {
        this.pop.toastWithTimer('error', err.error.message);
      }
    })
  }
}