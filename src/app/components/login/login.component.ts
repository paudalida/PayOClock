import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

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
        if (isLoggedIn) this.router.navigate(['main']);
        this.isLoading = false;
      })
    }
}
