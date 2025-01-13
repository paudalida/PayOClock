import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../../../../../services/data/data.service';
import { PopupService } from '../../../../../../services/popup/popup.service';

@Component({
  selector: 'app-change-pass',
  templateUrl: './change-pass.component.html',
  styleUrl: './change-pass.component.scss'
})
export class ChangePassComponent {

  form: FormGroup = this.fb.group({
    current:   ['', [ Validators.required, Validators.maxLength(20) ]],
    new:       ['', [ Validators.required, Validators.minLength(10), Validators.maxLength(20) ]],
    confirmed: ['', [ Validators.required, Validators.minLength(10), Validators.maxLength(20) ]]
  });

  isCurrentPasswordVisible: boolean = false;
  isNewPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;

  showCurrentPasswordIcon: boolean = false;
  showNewPasswordIcon: boolean = false;
  showConfirmPasswordIcon: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<ChangePassComponent>, 
    private router: Router,
    private fb: FormBuilder,
    private ds: DataService,
    private pop: PopupService
  ) {}

  submit() {
    if(this.form.valid) {
      if(this.form.get('new')?.value == this.form.get('confirmed')?.value) {
        this.ds.request('POST', 'admin/passwords/change/self', this.form.value).subscribe({
          next: (res: any) => {
            this.pop.toastWithTimer('success', res.message);
            this.closePopup();
          },
          error: (err: any) => {
            this.pop.swalBasic('error', 'Oops! Password update failed', err.error.message);
          }
        });
      } else {
        this.pop.swalBasic('error', 'Passwords do not match!', 'New password and confirmation password do not match');
      }
    }
  }

  closePopup() {
    this.dialogRef.close(); 
  }

  togglePasswordVisibility(field: string) {
    switch (field) {
      case 'currentPassword':
        this.isCurrentPasswordVisible = !this.isCurrentPasswordVisible;
        break;
      case 'newPassword':
        this.isNewPasswordVisible = !this.isNewPasswordVisible;
        break;
      case 'confirmPassword':
        this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
        break;
    }
  }

}
