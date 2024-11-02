import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../services/data/data.service';
import { PopupService } from '../../../../services/popup/popup.service';
import { EmployeeService } from '../../../../services/employee/employee.service';

@Component({
  selector: 'app-payslips',
  templateUrl: './payslips.component.html',
  styleUrl: './payslips.component.scss'
})
export class PayslipsComponent implements OnInit{
  

  constructor(
    private ds: DataService,
    private pop: PopupService,
    private router: Router,
    private es: EmployeeService
  ) { }

  isLoading = true;
  payday_start = ''; payday_end = ''; base_pay = 0; adjusted_pay = 0; total_additions = 0; total_deductions = 0; gross_pay = 0; net_pay = 0; hourly_rate = 0;
  attendance: any = []; deductions: any = []; additions: any = [];
  values: any = [];
  employee: any;

  ngOnInit(): void {
    this.employee = this.es.getEmployee();

    this.ds.request('GET', 'employee/payslips/latest').subscribe({
      next: (res: any) => {
        this.payday_start     = res.data.payday_start;
        this.payday_end       = res.data.payday_end;
        this.base_pay         = res.data.base_pay;
        this.adjusted_pay     = res.data.adjusted_pay;
        this.total_additions  = res.data.total_additions;
        this.total_deductions = res.data.total_deductions;
        this.gross_pay        = res.data.gross_pay;
        this.net_pay          = res.data.net_pay;
        this.hourly_rate      = res.data.hourly_rate;
        
        let longest = res.data.payslip.attendance.types.length;
        const payslip = res.data.payslip;
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
          
          this.values.push([col1, col2, col3, col4, col5, col6, col7]);
        }
      },
      error: (err: any) => {
        this.pop.swalBasic('error', 'Oops!', err.error.message)
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // get employee() {
  //   return this.as.getEmployee();
  // }

  redirectToPayslipHistory() {
    this.router.navigate(['/employee/payslips/payslips-history']);
  }

}
