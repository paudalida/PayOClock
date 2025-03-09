import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminService } from '../../../../../services/admin/admin.service';

import { Router } from '@angular/router';
import { DataService } from '../../../../../services/data/data.service';
import { PopupService } from '../../../../../services/popup/popup.service';


@Component({
  selector: 'app-indiv-payslip',
  templateUrl: './indiv-payslip.component.html',
  styleUrl: './indiv-payslip.component.scss'
})
export class IndivPayslipComponent implements OnInit{
  employee: any;

  constructor(
    private dialogRef: MatDialogRef<IndivPayslipComponent>, 
    private as: AdminService, 
    private ds: DataService,
    private pop: PopupService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  isLoading = true;
  payday_start = ''; payday_end = ''; base_pay = 0; adjusted_pay = 0; total_additions = 0; total_deductions = 0; gross_pay = 0; net_pay = 0;
  attendance: any = []; deductions: any = []; additions: any = []; rate = 0;
  values: any = [];
  noPayslip = false;
  allowanceStart = 0;
  payslip: any;
  totals = {
    attendance: 0,
    other_earnings: 0,
    gross: 0,

    deductions: 0,
    other_deductions: 0,
    total_deductions: 0,
    net_pay: 0
  };

  ngOnInit(): void {
    this.employee = this.as.getEmployee();
    if(!this.employee.id) { this.router.navigate(['/admin/payrolls']); } // return to payrolls if employee data is not set (browser refreshed)

    let endUrl = this.employee.id;
    if(this.data) {
      endUrl += `/${this.data.start}/${this.data.end}`
    }
    this.ds.request('GET', 'admin/payslips/get/user/' + endUrl).subscribe({
      next: (res: any) => {

        if(!res.data) { this.noPayslip = true; return; }
        this.payslip = res.data.payslip;
        this.rate = res.data.rate;
 
       for(let i = 0; i < this.payslip.attendance.types.length; i++) {
          const amount = parseFloat(this.payslip.attendance.amounts[i].replace(/[^\d.-]/g, ''));
          this.totals.attendance += amount;
          this.totals.gross += amount;
          this.totals.net_pay += amount;
        }
        
        for(let i = 0; i < this.payslip.allowance.types.length; i++) {
          const amount = parseFloat(this.payslip.allowance.amounts[i].replace(/[^\d.-]/g, ''));
          this.totals.other_earnings += amount;
          this.totals.gross += amount;
          this.totals.net_pay += amount;
        };

        for(let i = 0; i < this.payslip.deduction.types.length; i++) {
          const amount = parseFloat(this.payslip.deduction.amounts[i].replace(/[^\d.-]/g, ''));
          this.totals.deductions += amount;
          this.totals.total_deductions += amount;
          this.totals.net_pay -= amount;
        };

        for(let i = 0; i < this.payslip.other_deduction.types.length; i++) {
          const amount = parseFloat(this.payslip.other_deduction.amounts[i].replace(/[^\d.-]/g, ''));
          this.totals.other_deductions += amount;
          this.totals.total_deductions += amount;
          this.totals.net_pay -= amount;
        };
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  redirectToHistory() {
    this.dialogRef.close();
    this.router.navigate(['/admin/payroll/payslips-history']);
  }

  closePopup() {
    this.dialogRef.close();
  }
}
