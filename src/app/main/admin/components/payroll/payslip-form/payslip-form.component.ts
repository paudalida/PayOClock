import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../../services/admin/admin.service';
import { Router } from '@angular/router';
import { DataService } from '../../../../../services/data/data.service';
import { MatListSubheaderCssMatStyler } from '@angular/material/list';
import { PopupService } from '../../../../../services/popup/popup.service';

@Component({
  selector: 'app-payslip-form',
  templateUrl: './payslip-form.component.html',
  styleUrl: './payslip-form.component.scss'
})
export class PayslipFormComponent implements OnInit{

  constructor(
    private as: AdminService,
    private ds: DataService,
    private pop: PopupService,
    private router: Router
  ) { }

  isLoading = true;
  payday = ''; base_pay = 0; adjusted_pay = 0; total_additions = 0; total_deductions = 0; gross_pay = 0; net_pay = 0;
  attendance: any = []; deductions: any = []; additions: any = [];
  values: any = [];

  ngOnInit(): void {
    if(!this.employee.id) { this.router.navigate(['/admin/payrolls']); } // return to payrolls if employee data is not set (browser refreshed)

    this.ds.request('GET', 'admin/payslips/latest/user/' + this.employee.id).subscribe({
      next: (res: any) => {
        this.payday           = res.data.payday;
        this.base_pay         = res.data.base_pay;
        this.adjusted_pay     = res.data.adjusted_pay;
        this.total_additions  = res.data.total_additions;
        this.total_deductions = res.data.total_deductions;
        this.gross_pay        = res.data.gross_pay;
        this.net_pay          = res.data.net_pay;

        let attendanceIndex = 0; let addDeductIndex = 0; let lastIndex = 0;
        // let attAddition = res.data.payslip['attendance addition'] || [];
        // let attDeduction = res.data.payslip['attendance deduction'] || [];
        
        // let longest = attAddition.types.length + attDeduction.types.length + 1; /* Include basic salary field */
        let longest = res.data.payslip.allowance.types.length;
        // if(longest < res.data.payslip.allowance.types.length) longest = res.data.payslip.allowance.types.length;
        if(longest < res.data.payslip.deduction.types.length) longest = res.data.payslip.deduction.types.length;

        for(let i = 0; i < longest; i ++) {
          let col1 = '';
          let col2 = '';
          let col3 = '';
          let col4 = res.data.payslip.allowance.types[i]   || '';
          let col5 = '';
          let col6 = res.data.payslip.allowance.amounts[i] || '';
          let col7 = res.data.payslip.deduction.types[i]   || '';
          let col8 = res.data.payslip.deduction.amounts[i] || '';

          if(i == 0) {

            col1 = 'Base Pay';
            col3 = String(this.base_pay);

          } else if(i > 0) {

            // if(i < attAddition.types.length+1) {
            //   col1 = attAddition.types[i-1];
            //   col3 = attAddition.amounts[i-1];
            // } else if(i < attAddition.types.length+1 + attDeduction.types.length) {
            //   col1 = attDeduction.types[i - attAddition.types.length-1];
            //   col3 = attDeduction.amounts[i - attAddition.types.length-1];
            // }

          }

          if(res.data.payslip.allowance.sub_types[i])
            col4 += ' ' + res.data.payslip.allowance.sub_types[i];

          if(res.data.payslip.deduction.sub_types[i])
            col7 += ' ' + res.data.payslip.deduction.sub_types[i];
          
          this.values.push([col1, col2, col3, col4, col5, col6, col7, col8]);
        }
      },
      error: (err: any) => {
        this.pop.swalBasic('error', 'Oops!', 'Cannot fetch payslips at the moment. Please try again later')
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  getPayDateRange(date: string): string {
    const day = new Date().getDate();
    const payday = new Date(date);

    // Assuming payday is the end of the month if day > 15, otherwise 1-15
    if (day > 15) {
      const endOfMonth = new Date(payday.getFullYear(), payday.getMonth() + 1, 0);
      return `16 - ${endOfMonth.getDate()}`;
    } else {
      return '1 - 15';
    }
  }

  get employee() {
    return this.as.getEmployee();
  }
  
  redirectToPayrolls() {
    this.router.navigate(['/admin/payrolls']);
  }

  redirectToPayslipHistory() {
    this.router.navigate(['/admin/payrolls/payslips-history']);
  }
}