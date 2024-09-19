import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../../services/admin/admin.service';
import { Router } from '@angular/router';
import { DataService } from '../../../../../services/data/data.service';
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
        
        let longest = res.data.payslip.attendance.types.length;
        if(longest < res.data.payslip.allowance.types.length) longest = res.data.payslip.allowance.types.length;
        if(longest < res.data.payslip.deduction.types.length) longest = res.data.payslip.deduction.types.length;

        for(let i = 0; i < longest; i ++) {
          let col1 = res.data.payslip.attendance.types[i]   || '';
          let col2 = res.data.payslip.attendance.amounts[i] || '';
          let col3 = res.data.payslip.allowance.types[i]    || '';
          let col4 = res.data.payslip.allowance.amounts[i]  || '';
          let col5 = res.data.payslip.deduction.types[i]    || '';
          let col6 = res.data.payslip.deduction.amounts[i]  || '';

          if(res.data.payslip.allowance.sub_types[i])
            col3 += ' ' + res.data.payslip.allowance.sub_types[i];

          if(res.data.payslip.deduction.sub_types[i])
            col5 += ' ' + res.data.payslip.deduction.sub_types[i];
          
          this.values.push([col1, col2, col3, col4, col5, col6]);
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
    this.router.navigate(['/admin/payslips']);
  }

  redirectToPayslipHistory() {
    this.router.navigate(['/admin/payslips/payslips-history']);
  }
}