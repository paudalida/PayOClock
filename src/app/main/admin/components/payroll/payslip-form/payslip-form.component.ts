import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../../services/admin/admin.service';
import { Router } from '@angular/router';
import { DataService } from '../../../../../services/data/data.service';

@Component({
  selector: 'app-payslip-form',
  templateUrl: './payslip-form.component.html',
  styleUrl: './payslip-form.component.scss'
})
export class PayslipFormComponent implements OnInit{

  constructor(
    private as: AdminService,
    private ds: DataService,
    private router: Router
  ) { }

  employeeRecord: any;
  allowances: any = []; deductions: any = []; payday: any;
  totalAllowance = 0; totalDeductions = 0;

  ngOnInit(): void {
    this.employeeRecord = this.as.getEmployee();

    if(!this.employeeRecord.id) { this.router.navigate(['/admin/payrolls']); } // return to payrolls if employee data is not set (browser refreshed)

    this.ds.request('GET', 'admin/transactions/latest/user/' + this.employeeRecord.id).subscribe({
      next: (res: any) => {
        let deductions: any = []; let otherDeductions: any = []; let hasPayday = false;
        res.data.forEach((element: any) => {

          if(!hasPayday) {
            this.payday = element.payday;
            hasPayday = true;
          }          

          let data = {
            type: element.type,
            amount: element.amount
          };

          switch(element.transaction_type) {
            case 'allowance': 
              this.allowances.push(data); 
              this.totalAllowance += data.amount;
              break;

            case 'deduction':
              const recordToUpdate = deductions.find((deduction: any) => deduction.type === data.type);
              if(recordToUpdate) { recordToUpdate.amount += data.amount; this.totalDeductions += data.amount; }
              else deductions.push(data); 
              break;

            case 'other deduction':
              otherDeductions.push(data); 
              this.totalDeductions += data.amount;
              break;
          }
        });

        this.deductions = [...deductions, ...otherDeductions];
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
    return this.employeeRecord;
  }
  
  redirectToPayslipHistory() {
    this.router.navigate(['/admin/payrolls/payslips-history']);
  }
}