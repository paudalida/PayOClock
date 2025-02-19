import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../../services/data/data.service';
import { PopupService } from '../../../../../services/popup/popup.service';
import { EmployeeService } from '../../../../../services/employee/employee.service';
import html2pdf from 'html2pdf.js';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-payslip-history',
  templateUrl: './payslip-history.component.html',
  styleUrl: './payslip-history.component.scss'
})
export class PayslipHistoryComponent implements OnInit{

  constructor(
    private ds: DataService,
    private pop: PopupService,
    private router: Router,
    private es: EmployeeService
  ) { }

  payslips: any = [];
  activeTable = 0; hasActive = true;

  isLoading = true;
  payslipDetails: any = [];
  employee: any;

  paginatorIndex = 1;
  paginatorCount = 5;

  ngOnInit(): void {
    this.employee = this.es.getEmployee();

    this.ds.request('GET', 'employee/payslips/history').subscribe({
      next: (res: any) => {
        this.payslips = res.data;
        res.data.forEach((element: any) => {      
          let values = [];

          let total_monthly = 0; let total_other_deductions = 0;
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
            let col8 = payslip.other_deduction.types[i]    || '';
            let col9 = payslip.other_deduction.amounts[i]  || '';

            if(col7) total_monthly += parseFloat(payslip.deduction.amounts[i].replace(/[₱,]/g, ''));
            if(col9) total_other_deductions += parseFloat(payslip.other_deduction.amounts[i].replace(/[₱,]/g, ''));

            /* Append subtypes */
            if(payslip.allowance.subtypes[i])
              col4 += ' ' + payslip.allowance.subtypes[i];

            if(payslip.deduction.subtypes[i])
              col6 += ' ' + payslip.deduction.subtypes[i];
            
            values.push([col1, col2, col3, col4, col5, col6, col7, col8, col9]);
          }          

          this.payslipDetails.push({
            position         : element.position,
            rate             : element.rate,
            payday_start     : element.payday_start,
            payday_end       : element.payday_end,
            released_at      : element.released_at,
            base_pay         : element.base_pay,
            adjusted_pay     : element.adjusted_pay,
            total_additions  : element.total_additions,
            total_monthly    : total_monthly,
            total_other_deductions : total_other_deductions,
            total_deductions : element.total_deductions,
            gross_pay        : element.gross_pay,
            net_pay          : element.net_pay
          });
          
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

  downloadPDF(i: number) {
    const element = document.getElementById('printSection' + i); // Get the div to convert
  
    if (!element) {
      console.error('Print section not found!');
      return;
    }
  
    const table = element.querySelector('.table-content') as HTMLElement;
    const textElements = table.querySelectorAll('*');
    const hidden = document.querySelectorAll('.hide-on-print'); // Select elements to hide
    const show = document.querySelectorAll('.show-on-print'); // Select elements to show

    // Hide elements before generating PDF
    hidden.forEach(hidden => (hidden as HTMLElement).style.display = 'none');
    show.forEach(show => (show as HTMLElement).style.display = 'block');
    textElements.forEach(el => {
      (el as HTMLElement).style.fontSize = '10px';
    });

    html2pdf()
      .set({
        margin: 0,
        filename: this.employee.full_name + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      })
      .from(element)
      .save()
      .then(() => {  // Reset to defaults
        hidden.forEach(hidden => (hidden as HTMLElement).style.display = 'block');
        show.forEach(show => (show as HTMLElement).style.display = 'none');
        textElements.forEach(el => {
          (el as HTMLElement).style.fontSize = '';
        });
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

  clickTable(index: number) {
    if(this.activeTable == index && this.hasActive) this.hasActive = !this.hasActive;
    else { this.activeTable = index; this.hasActive = true; }
  }

  redirectToPayslip() {
    this.router.navigate(['/employee/payslips']);
  }

  /* Paginator functions */
  changePaginator(event: Event) {
    const count = (event.target as HTMLSelectElement).value;
    this.paginatorCount = Number(count);
    this.paginatorIndex = 1;
  }

  first() {
    this.paginatorIndex = 1;
  }

  next() {
    if((this.paginatorIndex + this.paginatorCount) < this.payslips.length)
      this.paginatorIndex += this.paginatorCount;
  }

  previous() {
    if((this.paginatorIndex - this.paginatorCount) >= 1 )
      this.paginatorIndex -= this.paginatorCount;
  }

  last() {
    const length = this.payslips.length;
    const excess = (length % this.paginatorCount) == 0 ? (this.paginatorCount) : (length % this.paginatorCount);
    this.paginatorIndex = length - excess+1;
  }
}
