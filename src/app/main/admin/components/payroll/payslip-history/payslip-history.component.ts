import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../../services/admin/admin.service';
import { Router } from '@angular/router';
import { DataService } from '../../../../../services/data/data.service';

@Component({
  selector: 'app-payslip-history',
  templateUrl: './payslip-history.component.html',
  styleUrl: './payslip-history.component.scss'
})
export class PayslipHistoryComponent implements OnInit{

  constructor(
    private as: AdminService,
    private ds: DataService,
    private router: Router
  ) { }

  payslips: any = [];
  activeTable = 0; hasActive = true;

  ngOnInit(): void {
    
    if(!this.employee.id) this.router.navigate(['admin/payrolls']);

    this.ds.request('GET', 'admin/transactions/history/user/' + this.employee.id).subscribe({
      next: (res: any) => {
        res.data.forEach((element: any) => {
          const data = {
            payday: element.payday,
            type: element.type,
            amount: element.amount
          };

          // Find the index of the entry with the same payday
          const index = this.payslips.findIndex((item: any) => item.payday === data.payday);

          if (index === -1) { // does not exist

            if(element.transaction_type == 'addition') {
              if(data.type == 'hourly wage') this.payslips.push({payday: data.payday, hourlyWage: data.amount, totalAllowance: 0, totalDeductions: 0, allowances: [], deductions: []});
            } 
            else if(element.transaction_type == 'allowance') {
              this.payslips.push({payday: data.payday, hourlyWage: 0, totalAllowance: 0, totalDeductions: 0, allowances: [data], deductions: []});
              this.payslips[this.payslips.length - 1].totalAllowance += data.amount;
            } 
            else if(element.transaction_type == 'deduction' || element.transaction_type == 'other deduction') {
              this.payslips.push({payday: data.payday, hourlyWage: 0, totalAllowance: 0, totalDeductions: 0, allowances : [], deductions: [data]});
              this.payslips[this.payslips.length - 1].totalDeductions += data.amount;
            }
          } else { // exists

            switch(element.transaction_type) {
              case 'addition':
                if(data.type == 'hourly wage') this.payslips[index].hourlyWage = data.amount;
                break;

              case 'allowance':
                this.payslips[index].allowances.push(data);
                this.payslips[index].totalAllowance += data.amount;
                break;

              case 'deduction':
                // Find the index of the existing deduction type
                const deductionIndex = this.payslips[index].deductions.findIndex((ded: any) => ded.type === data.type);
                
                if (deductionIndex === -1) { this.payslips[index].deductions.push(data); } 
                else { this.payslips[index].deductions[deductionIndex].amount += data.amount; }
                
                this.payslips[index].totalDeductions += data.amount; 
                break;

              case 'other deduction':
                this.payslips[index].deductions.push(data);
                this.payslips[index].totalDeductions += data.amount; 
                break;
            }
          }
        });
      },
      error: () => {

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
