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

          let attAddMax = 0; let attDedMax = 0; let lastIndex = 0;
          let attAddition = element.payslip['attendance addition'] || null;
          let attDeduction = element.payslip['attendance deduction'] || null;
          let deduction = element.payslip.deduction || null;
          let allowance = element.payslip.allowance || null;
          let other_deduction = element.payslip.other_deduction || null;
          
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
              col3 = String(element.base_pay);

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

            if(element.payslip.allowance.sub_types[i])
              col4 += ' ' + element.payslip.allowance.sub_types[i];

            if(element.payslip.deduction.sub_types[i])
              col7 += ' ' + element.payslip.deduction.sub_types[i];
            
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
    this.router.navigate(['/admin/payrolls/payslip']);
  }

  redirectToPayrolls() {
    this.router.navigate(['/admin/payrolls']);
  }
}
