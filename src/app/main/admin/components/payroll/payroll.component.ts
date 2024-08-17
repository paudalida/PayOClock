import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../services/admin/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrl: './payroll.component.scss'
})
export class PayrollComponent implements OnInit{

  constructor(
    private as: AdminService,
    private router: Router
  ) { }

  employees: any;

  set employee(data: any) {
    this.as.setEmployee(data);
  }

  ngOnInit(): void {
    this.employees = this.as.getEmployees();
  }

  redirectToForms() {
    this.router.navigate(['/admin/payroll-forms']);
  }
}
