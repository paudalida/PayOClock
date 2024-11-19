import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../../../../../services/data/data.service';
import { PopupService } from '../../../../../../services/popup/popup.service';

@Component({
  selector: 'app-change-pass-employee',
  templateUrl: './change-pass-employee.component.html',
  styleUrls: ['./change-pass-employee.component.scss']
})
export class ChangePassEmployeeComponent {
  form: FormGroup = this.fb.group({
    new: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(20)]],
    confirmed: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(20)]],
  });

  isNewPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<ChangePassEmployeeComponent>,
    private router: Router,
    private fb: FormBuilder,
    private ds: DataService,
    private pop: PopupService
  ) {}

  submit() {
    this.pop
      .swalWithInput(
        'warning',
        'Admin Authentication',
        'Please enter password to confirm.',
        'password'
      )
      .then((adminPassword) => {
        if (adminPassword) {
          this.ds.request('POST', 'admin/password/validate', { password: adminPassword }).subscribe({
            next: (res: any) => {
              if (res.valid) {
                if (this.form.valid) {
                  if (this.form.get('new')?.value === this.form.get('confirmed')?.value) {
                    const requestData = { ...this.form.value };
                    this.ds.request('POST', 'employee/password/change', requestData).subscribe({
                      next: (res: any) => {
                        this.pop.toastWithTimer('success', res.message);
                      },
                      error: (err: any) => {
                        this.pop.swalBasic('error', 'Password Update Failed', err.error.message);
                      },
                    });
                  } else {
                    this.pop.swalBasic('error', 'Passwords Do Not Match!', 'New and confirmation passwords do not match.');
                  }
                } else {
                  this.pop.swalBasic('error', 'Invalid Form', 'Please fill out all required fields correctly.');
                }
              } else {
                this.pop.swalBasic('error', 'Authentication Failed', 'Incorrect admin password.');
              }
            },
            error: () => {
              this.pop.swalBasic('error', 'Authentication Error', 'Unable to validate admin password.');
            },
          });
        } else {
          this.pop.toastWithTimer('info', 'Password update canceled.');
        }
      });
  }

  closePopup() {
    this.dialogRef.close();
    this.router.navigate(['/admin/settings/profile']);
  }

  togglePasswordVisibility(field: string) {
    switch (field) {
      case 'newPassword':
        this.isNewPasswordVisible = !this.isNewPasswordVisible;
        break;
      case 'confirmPassword':
        this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
        break;
    }
  }
}
