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

        let attAddMax = 0; let attDedMax = 0; let lastIndex = 0;
        let attAddition = res.data.payslip['attendance addition'] || null;
        let attDeduction = res.data.payslip['attendance deduction'] || null;
        let deduction = res.data.payslip.deduction || null;
        let allowance = res.data.payslip.allowance || null;
        let other_deduction = res.data.payslip.other_deduction || null;
        
        /* get longest index */
        let longest = 1; /* basic salary field */
        if(attAddition) {
          attAddMax = attAddition.types.length;
          longest += attAddition.types.length;
        }

        if(attDeduction) {
          attDedMax = attDeduction.types.length;
          longest += attDeduction.types.length;
        }

        if(allowance) {
          if(longest < allowance.types.length) 
            longest = allowance.types.length;
        }

        if(deduction) {
          let total = deduction.types.length;

          if(other_deduction)
            total += other_deduction.types.length;

          if(longest < total) 
            longest = total;
        }
        
        for(let i = 0; i < longest; i ++) {
          let col1 = '';
          let col2 = '';
          let col3 = '';
          let col4 = allowance.types[i]   || '';
          let col5 = '';
          let col6 = allowance.amounts[i] || '';
          let col7 = deduction.types[i]   || '';
          let col8 = deduction.amounts[i] || '';

          if(i == 0) {

            col1 = 'Base Pay';
            col3 = String(this.base_pay);

          } else if(i > 0) {

            if(attAddition) {
              if(i < attAddition.types.length+1) {
                col1 = attAddition.types[i-1];
                col3 = attAddition.amounts[i-1];
              }
            }

            if(attDeduction){
             
              if(i < attAddMax + attDeduction.types.length + 1) {
                col1 = attDeduction.types[i - attAddMax-1];
                col3 = attDeduction.amounts[i - attAddMax-1];
              }
            }
          }

          if(i >= deduction.types.length) {
            col7 = other_deduction.types[i-deduction.types.length] || '';
            col8 = other_deduction.amounts[i-deduction.types.length] || '';
          }

          if(allowance.sub_types[i])
            col4 += ' ' + allowance.sub_types[i];

          if(deduction.sub_types[i])
            col7 += ' ' + deduction.sub_types[i];
          
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
    if(!date || date == '') return '';
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