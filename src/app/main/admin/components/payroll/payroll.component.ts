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
  paginatorIndex = 0;
  paginatorCount = 5;

  set employee(data: any) {
    this.as.setEmployee(data);
  }

  ngOnInit(): void {
    this.employees = this.as.getEmployees();
  }

  redirectToPayroll() {
    this.router.navigate(['/admin/payrolls/form']);
  }

  redirectToPayslip() {
    this.router.navigate(['/admin/payrolls/payslip']);
  }

  /* Paginator functions */
  changePaginator(event: Event) {
    const count = (event.target as HTMLSelectElement).value;
    this.paginatorCount = Number(count);
    this.paginatorIndex = 0;
  }

  first() {
    this.paginatorIndex = 0;
  }

  next() {
    if((this.paginatorIndex + this.paginatorCount) < this.employees.length)
      this.paginatorIndex += this.paginatorCount;
  }

  previous() {
    if((this.paginatorIndex - this.paginatorCount) >= 0 )
      this.paginatorIndex -= this.paginatorCount;
  }

  last() {
    this.paginatorIndex = this.employees.length - (this.employees.length % this.paginatorCount) - (this.paginatorCount);
  }
}
