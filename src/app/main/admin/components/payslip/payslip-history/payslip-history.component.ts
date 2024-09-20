import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../../services/admin/admin.service';
import { Router } from '@angular/router';
import { DataService } from '../../../../../services/data/data.service';
import { PopupService } from '../../../../../services/popup/popup.service';

@Component({
  selector: 'app-payslip-history',
  templateUrl: './payslip-history.component.html',
  styleUrl: './payslip-history.component.scss'
})
export class PayslipHistoryComponent implements OnInit{

  constructor(
    private as: AdminService,
    private ds: DataService,
    private pop: PopupService,
    private router: Router
  ) { }

  payslips: any = [];
  activeTable = 0; hasActive = true;

  isLoading = true;
  payslipDetails: any = [];

  ngOnInit(): void {
    if(!this.employee.id) { this.router.navigate(['/admin/payrolls']); } // return to payrolls if employee data is not set (browser refreshed)

    this.ds.request('GET', 'admin/payslips/history/user/' + this.employee.id).subscribe({
      next: (res: any) => {
        res.data.forEach((element: any) => {      
          let values = [];

          this.payslipDetails.push({
            payday           : element.payday,
            base_pay         : element.base_pay,
            adjusted_pay     : element.adjusted_pay,
            total_additions  : element.total_additions,
            total_deductions : element.total_deductions,
            gross_pay        : element.gross_pay,
            net_pay          : element.net_pay
          });

          let lastIndex = 0;
          // let attAddition = element.payslip['attendance addition'] || [];
          // let attDeduction = element.payslip['attendance deduction'] || [];
          
          // let attAddition = res.data.payslip['attendance addition'] || [];
          // let attDeduction = res.data.payslip['attendance deduction'] || [];
          
          // let longest = attAddition.types.length + attDeduction.types.length + 1; /* Include basic salary field */
          console.log(element.payslip.allowance.types);
          let longest = element.payslip.allowance.types.length;
          // if(longest < res.data.payslip.allowance.types.length) longest = res.data.payslip.allowance.types.length;
          if(longest < element.payslip.deduction.types.length) longest = element.payslip.deduction.types.length;

          for(let i = 0; i < longest; i ++) {
            let col1 = '';
            let col2 = '';
            let col3 = '';
            let col4 = element.payslip.allowance.types[i]   || '';
            let col5 = '';
            let col6 = element.payslip.allowance.amounts[i] || '';
            let col7 = element.payslip.deduction.types[i]   || '';
            let col8 = element.payslip.deduction.amounts[i] || '';

            if(i == 0) {

              col1 = 'Base Pay';
              col3 = String(element.base_pay);

            } else if(i > 0) {

              // if(i < attAddition.types.length+1) {
              //   col1 = attAddition.types[i-1];
              //   col3 = attAddition.amounts[i-1];
              // } else if(i < attAddition.types.length+1 + attDeduction.types.length) {
              //   col1 = attDeduction.types[i - attAddition.types.length-1];
              //   col3 = attDeduction.amounts[i - attAddition.types.length-1];
              // }

            }

            if(element.payslip.allowance.subtypes[i])
              col4 += ' ' + element.payslip.allowance.subtypes[i];

            if(element.payslip.deduction.subtypes[i])
              col7 += ' ' + element.payslip.deduction.subtypes[i];
            
            values.push([col1, col2, col3, col4, col5, col6, col7, col8]);
          }
          
          this.payslips.push(values);
        });
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
    const payday = new Date(date);
    const dayOfPayday = payday.getDate();
  
    const endOfMonth = new Date(payday.getFullYear(), payday.getMonth() + 1, 0).getDate();
  
    if (dayOfPayday === 15) {
      return '1 - 15';
    } else if (dayOfPayday === endOfMonth) {
      return `16 - ${endOfMonth}`;
    } else {
      return 'N/A';
    }
  }

  get employee() {
    return this.as.getEmployee();
  }

  clickTable(index: number) {
    if(this.activeTable == index && this.hasActive) this.hasActive = !this.hasActive;
    else { this.activeTable = index; this.hasActive = true; }
  }

  redirectToPayslip() {
    this.router.navigate(['/admin/payslips/payslip']);
  }

  redirectToPayrolls() {
    this.router.navigate(['/admin/payslips']);
  }
}

