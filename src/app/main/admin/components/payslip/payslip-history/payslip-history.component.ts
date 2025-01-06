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
  hasData = false;
  payslipDetails: any = [];

  paginatorIndex = 1;
  paginatorCount = 5;
  posts: any[] = [];

  ngOnInit(): void {
    if(!this.employee.id) { this.router.navigate(['/admin/payrolls']); } // return to payrolls if employee data is not set (browser refreshed)

    this.ds.request('GET', 'admin/payslips/history/user/' + this.employee.id).subscribe({
      next: (res: any) => {

        if(res.data.length == 0) { this.hasData = false; return; }
        else { this.hasData = true; }
        
        res.data.forEach((element: any) => {      
          let values = [];

          this.payslipDetails.push({
            payday_start     : element.payday_start,
            payday_end       : element.payday_end,
            base_pay         : element.base_pay,
            adjusted_pay     : element.adjusted_pay,
            total_additions  : element.total_additions,
            total_deductions : element.total_deductions,
            gross_pay        : element.gross_pay,
            net_pay          : element.net_pay
          });

          let longest = element.payslip.attendance.types.length;
          const payslip = element.payslip;
          if(longest < payslip.allowance.types.length) longest = payslip.allowance.types.length;
          if(longest < payslip.deduction.types.length + payslip.other_deduction.types.length) longest = payslip.deduction.types.length + payslip.other_deduction.types.length;

          for(let i = 0; i < longest; i ++) {
            let col1 = payslip.attendance.types[i]   || '';
            let col2 = payslip.attendance.hours[i]   || '';
            let col3 = payslip.attendance.amounts[i] || '';
            let col4 = payslip.allowance.types[i]    || '';
            let col5 = payslip.allowance.amounts[i]  || '';
            let col6 = payslip.deduction.types[i]    || '';
            let col7 = payslip.deduction.amounts[i]  || '';

            /* For other deductions */
            if(i >= payslip.deduction.types.length) {   
              
              let index = i - payslip.deduction.types.length;
              if(index < payslip.other_deduction.types.length) {
                col6 = payslip.other_deduction.types[index]    || '';
                col7 = payslip.other_deduction.amounts[index]  || '';
              }    
            }

            /* Append subtypes */
            if(payslip.allowance.subtypes[i])
              col4 += ' ' + payslip.allowance.subtypes[i];

            if(payslip.deduction.subtypes[i])
              col6 += ' ' + payslip.deduction.subtypes[i];
            
            values.push([col1, col2, col3, col4, col5, col6, col7]);
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

  changePaginator(event: Event) {
    const count = (event.target as HTMLSelectElement).value;
    this.paginatorCount = Number(count);
    this.paginatorIndex = 0;
  }

  first() {
    this.paginatorIndex = 0;
  }

  next() {
    if (this.paginatorIndex + this.paginatorCount < this.posts.length) {
      this.paginatorIndex += this.paginatorCount;
    }
  }

  previous() {
    if (this.paginatorIndex - this.paginatorCount >= 0) {
      this.paginatorIndex -= this.paginatorCount;
    }
  }

  last() {
    const totalPages = Math.ceil(this.posts.length / this.paginatorCount);
    this.paginatorIndex = (totalPages - 1) * this.paginatorCount;
  }
}

