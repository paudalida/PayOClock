import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeService } from '../../../../services/employee/employee.service';
import { ChangePasswordComponent } from './change-password/change-password.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  constructor(
    private dialog: MatDialog,
    private es: EmployeeService
  ) {}

  
  activeTable = -1; 
  hasActive = false; 
  items: any = [1]; 
  
  get employee() {
    return this.es.getEmployee();
  }

  
  clickTable(index: number) {
    
    if (this.activeTable === index) {
      this.hasActive = !this.hasActive;
    } else {
      
      this.activeTable = index;
      this.hasActive = true;  
    }
  }
  
  openDialog() {
    if (this.dialog) {
      this.dialog.open(ChangePasswordComponent);
    } else {
      console.error('Dialog is not initialized');
    }
  }
}
