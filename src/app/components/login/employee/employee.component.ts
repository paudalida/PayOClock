import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent {

  constructor(
    private as: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog 
  ) {}

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.maxLength(20)]], 
    termsAndConditions: [false, Validators.requiredTrue]
  });

  isLoading = false;
  showPassword: boolean = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  openTermsAndConditions(): void {
      this.dialog.open(TermsConditionsComponent, {
        width: '500px',
        disableClose: true
      });
    }
  
 async submitLogin(): Promise<void> {
    if (this.loginForm.valid) {
      this.isLoading = true;

      try {
        const success = await this.as.login('employee', this.loginForm.value);
        if (success) {
          this.router.navigate(['/employee']);
        } else {
          alert('Invalid credentials');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login.');
      } finally {
        this.isLoading = false;
      }
    } else {
      alert('Please fill in all fields and accept the Terms and Conditions.');
    }
  }
}

