import { Component } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { EditProfileComponent } from '../popup/edit-profile/edit-profile.component';
import { EmployeeService } from '../../../../services/employee/employee.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {


  constructor (
    private dialog: MatDialog,
    private es: EmployeeService
  ) {}

  get employee() {
    return this.es.getEmployee();
  }
  
  openDialog() {
    if (this.dialog) {
      this.dialog.open(EditProfileComponent);
    } else {
      console.error('Dialog is not initialized');
    }
  }
}
