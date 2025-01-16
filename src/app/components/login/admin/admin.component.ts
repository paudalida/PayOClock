import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {

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
    this.dialog.open(TermsAndConditionsComponent, {
      width: '500px',
      disableClose: true
    });
  }

  async submitLogin() {
    this.isLoading = true;

    const success = await this.as.login('admin', this.loginForm.value);
    this.isLoading = false;
  }
}
