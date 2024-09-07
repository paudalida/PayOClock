import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EmployeeComponent } from '../employee.component';


@Component({
  selector: 'app-view-details',
  templateUrl: './view-details.component.html',
  styleUrl: './view-details.component.scss'
})
export class ViewDetailsComponent {

  constructor(private ref: MatDialogRef<EmployeeComponent>, private router: Router) {}

  closePopup(tab: string) {
    this.ref.close(); // Close the popup
    this.router.navigate(['/employee', { tab }]); // Navigate back to the employee tab
  }
}
