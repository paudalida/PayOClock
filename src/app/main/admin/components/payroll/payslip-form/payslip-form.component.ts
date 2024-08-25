import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../../services/admin/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payslip-form',
  templateUrl: './payslip-form.component.html',
  styleUrl: './payslip-form.component.scss'
})
export class PayslipFormComponent implements OnInit{

  constructor(
    private as: AdminService,
    private router: Router
  ) { }

  employeeRecord: any;
  nextPayroll: any;

  ngOnInit(): void {
    this.employeeRecord = this.as.getEmployee();

    if(!this.employeeRecord.id) { this.router.navigate(['/admin/payrolls']); } // return to payrolls if employee data is not set (browser refreshed)

    let currentDate = new Date();
    let date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    this.nextPayroll = date;
  }

  get employee() {
    return this.employeeRecord;
  }
  
  redirectToPayslipHistory() {
    this.router.navigate(['/admin/payrolls/payslip-history']);
  }
}