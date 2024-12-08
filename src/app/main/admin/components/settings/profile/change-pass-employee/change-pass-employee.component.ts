import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../../../../../services/data/data.service';
import { PopupService } from '../../../../../../services/popup/popup.service';
import { AdminService } from '../../../../../../services/admin/admin.service';

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
    private as: AdminService,
    private router: Router,
    private fb: FormBuilder,
    private ds: DataService,
    private pop: PopupService
  ) { }

  submit() {
    console.log('pasok')
    this.pop
      .swalWithInput(
        'warning',
        'Admin Authentication',
        'Please enter password to confirm.',
        'password'
      )
      .then((adminPassword) => {
        if (adminPassword) {
          const data = {
            new: this.form.get('confirmed')?.value,
            adminPassword: adminPassword
          };

          this.ds.request('POST', 'admin/passwords/change/employee/' + this.as.getEmployee().id, data).subscribe({
            next: (res: any) => {
              this.pop.toastWithTimer('success', res.message);
              this.closePopup();
            },
            error: (err: any) => {
              this.pop.swalBasic('error', 'Oops! Cannot update password!', err.error.message);
            }
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
