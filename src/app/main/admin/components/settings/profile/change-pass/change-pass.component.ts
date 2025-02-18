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
  warning: string = 'Empty form fields';

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

  checkPasswords() {
    // Reset the warning message
    this.warning = '';
  
    // Check if any of the fields are empty
    if (this.form.get('current')?.value.length == 0 || this.form.get('new')?.value.length == 0 || this.form.get('confirmed')?.value.length == 0) {
      this.warning = 'Fill in all form fields';
      return true;
    }
  
    // Check for validation errors
    const currentControl = this.form.get('current');
    const newControl = this.form.get('new');
    const confirmedControl = this.form.get('confirmed');
  
    // Warning for current password field
    if (currentControl?.hasError('required')) {
      this.warning = 'Current password is required';
      return true;
    }
  
    // Warnings for new password field
    if (newControl?.hasError('required')) {
      this.warning = 'New password is required';
      return true;
    } else if (newControl?.hasError('minlength')) {
      this.warning = 'New password must be at least 10 characters long';
      return true;
    } else if (newControl?.hasError('maxlength')) {
      this.warning = 'New password cannot exceed 20 characters';
      return true;
    }
  
    // Warnings for confirmed password field
    if (confirmedControl?.hasError('required')) {
      this.warning = 'Password confirmation is required';
      return true;
    } else if (newControl?.value != confirmedControl?.value) {
      this.warning = 'Passwords do not match';
      return true;
    }
  
    // If no errors, return false
    return false;
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
