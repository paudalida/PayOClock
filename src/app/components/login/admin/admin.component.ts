import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  
  constructor(
    private as: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.maxLength(20)]]
  });

  isLoading = false;
  
  submitLogin() {
    this.isLoading = true;
    this.as.login('admin', this.loginForm.value).subscribe(isLoggedIn => {
      if (isLoggedIn) this.router.navigate(['admin']);
      this.isLoading = false;
    })
  }
}
