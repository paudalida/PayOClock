import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  private userType = '';

  public get getUserType() {
    return this.userType;
  }

  public set setUserType(data: string) {
    this.userType = data;
  }

  public requestUserDetails() {
    return new Promise((resolve, reject) => {
      return this.http.post(this.header.url + 'auth/user', {}, {headers: this.header.authHeader}).subscribe({
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

  public login(form: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.http.post(this.header.url + 'auth/login', form).subscribe({
        next: (res: any) => {
          // Store session data
          sessionStorage.setItem('name', res.data.name);
          sessionStorage.setItem('position', res.data.position);
          sessionStorage.setItem('auth-token', res.data.token);
          this.es.setEmployee(res.data.user);
          this.userType = res.data.type;
  
          // Show success toast
          this.pop.toastWithTimer('success', res.message);
          this.router.navigate([res.data.type]);
  
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
    this.http.post(this.header.url + 'auth/logout', null, { headers: this.header.authHeader }).subscribe({
      next: (res: any) => {
        this.router.navigate(['/login']);
        sessionStorage.clear();
        this.pop.toastWithTimer('success', res.message);
      },
      error: (err: any) => {
        this.pop.toastWithTimer('error', err.error.message);
      }
    })
  }
}