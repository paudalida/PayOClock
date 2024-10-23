import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit {

  isCurrentPasswordVisible: boolean = false;
  isNewPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;

  showCurrentPasswordIcon: boolean = false;
  showNewPasswordIcon: boolean = false;
  showConfirmPasswordIcon: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<ChangePasswordComponent>, 
    private router: Router
  ) {}

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  closePopup() {
    this.dialogRef.close(); 
    this.router.navigate(['/employee/profile']);
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
