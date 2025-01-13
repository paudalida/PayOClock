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
  attendance: any = []; deductions: any = []; additions: any = []; hourly_rate = 0;
  values: any = [];
  noPayslip = false;
  allowanceStart = 0;

  ngOnInit(): void {
    console.log(this.data)
    this.employee = this.as.getEmployee();
    if(!this.employee.id) { this.router.navigate(['/admin/payrolls']); } // return to payrolls if employee data is not set (browser refreshed)

    let endUrl = this.employee.id;
    if(this.data) {
      endUrl += `/${this.data.start}/${this.data.end}`
    }
    this.ds.request('GET', 'admin/payslips/latest/user/' + endUrl).subscribe({
      next: (res: any) => {

        if(!res.data) { this.noPayslip = true; return; }

        this.payday_start     = res.data.payday_start;
        this.payday_end       = res.data.payday_end;
        this.base_pay         = res.data.base_pay;
        this.adjusted_pay     = res.data.adjusted_pay;
        this.total_additions  = res.data.total_additions;
        this.total_deductions = res.data.total_deductions;
        this.gross_pay        = res.data.gross_pay;
        this.net_pay          = res.data.net_pay;
        this.hourly_rate      = res.data.hourly_rate;
        
        const payslip = res.data.payslip;
        this.allowanceStart = payslip.attendance.types.length;
        let longest = payslip.attendance.types.length + payslip.allowance.types.length;
        if(longest < payslip.deduction.types.length + payslip.other_deduction.types.length) longest = payslip.deduction.types.length + payslip.other_deduction.types.length;

        for(let i = 0; i < longest; i ++) {
          let col1 = payslip.attendance.types[i];
          let col2 = payslip.attendance.hours[i];
          let col3 = payslip.attendance.amounts[i];
          
          let col4 = '';
          let col5 = '';

          if(i >= this.allowanceStart) {
            col4 = payslip.allowance.types[i - this.allowanceStart]    || '';
            col5 = payslip.allowance.amounts[i - this.allowanceStart]  || '';
          } else if(i < this.allowanceStart){
            col4 = '-';
            col5 = '-';
          }

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

  closePopup() {
    this.dialogRef.close();
  }
}
