import { Component } from '@angular/core';
import { DataService } from '../../services/data/data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

    constructor(
      private ds: DataService,
      private fb: FormBuilder,
      private router: Router
    ) { }

    loginForm: FormGroup = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.maxLength(20)]]
    });

    submitLogin() {
      this.ds.login('admin', this.loginForm.value).subscribe({
        next: (res: any) => {
this.router.navigate(['main']);
        }, error: (err: any) => {

        }
      })
    }
}
