import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ProfileComponent } from '../profile.component';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit {

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

}
