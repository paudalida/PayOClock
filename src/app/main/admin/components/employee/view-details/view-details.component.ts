import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EmployeeComponent } from '../employee.component';

@Component({
  selector: 'app-view-details',
  templateUrl: './view-details.component.html',
  styleUrls: ['./view-details.component.scss'] 
})
export class ViewDetailsComponent {

  constructor(
    private dialogRef: MatDialogRef<ViewDetailsComponent>, 
    private router: Router
  ) {}

  closePopup() {
    this.dialogRef.close(); 
    this.router.navigate(['/admin/employees']);
  }
}
