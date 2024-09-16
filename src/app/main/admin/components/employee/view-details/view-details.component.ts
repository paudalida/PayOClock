import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EmployeeComponent } from '../employee.component';
import { AdminService } from '../../../../../services/admin/admin.service';

@Component({
  selector: 'app-view-details',
  templateUrl: './view-details.component.html',
  styleUrls: ['./view-details.component.scss']
})
export class ViewDetailsComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<ViewDetailsComponent>, 
    private as: AdminService,
    private router: Router
  ) {}

  employee: any;

  ngOnInit(): void {
    this.employee = this.as.getEmployee();
  }
  closePopup() {
    this.dialogRef.close(); 
    this.router.navigate(['/admin/employees']);
  }
}
