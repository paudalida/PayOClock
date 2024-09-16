import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../services/admin/admin.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  constructor(
    private as: AdminService
  ) { }

  details = {
    employeeCount: 0,
    processed: 6,
    pending: 4
  }

  ngOnInit(): void {
    this.details.employeeCount = this.as.getEmployees().length;
  }
}
