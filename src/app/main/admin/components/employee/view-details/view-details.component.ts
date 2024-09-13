import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-details',
  templateUrl: './view-details.component.html',
  styleUrls: ['./view-details.component.scss']
})
export class ViewDetailsComponent {

  employee = {
    fullName: 'John Doe',
    idNumber: '123456',
    gender: 'Male',
    contactNumber: '098231547856',
    position: 'Admin',
    image: 'assets/images/no image.png',
  };

  constructor(
    private dialogRef: MatDialogRef<ViewDetailsComponent>, 
    private router: Router
  ) {}

  closePopup() {
    this.dialogRef.close(); 
    this.router.navigate(['/admin/employees']);
  }
}
