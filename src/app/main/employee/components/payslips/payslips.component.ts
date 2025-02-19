import { Component, HostListener, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../services/data/data.service';
import { PopupService } from '../../../../services/popup/popup.service';
import { EmployeeService } from '../../../../services/employee/employee.service';
// import html2pdf from 'html2pdf.js';

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

  isMobile: boolean = false;
  isLoading = true;
  position = ''; payday_start = ''; payday_end = ''; released_at = ''; 
  base_pay = 0; adjusted_pay = 0; total_additions = 0; total_deductions = 0; gross_pay = 0; net_pay = 0; rate = 0;
  attendance: any = []; deductions: any = []; additions: any = [];
  values: any = [];
  employee: any;
  payslips: any = [];
  payslipDetails: any = []; 
  noPayslip = false;
  payslip: any;
  totals = {
    attendance: 0,
    other_earnings: 0,
    gross: 0,

    deductions: 0,
    other_deductions: 0,
    total_deductions: 0,
    net_pay: 0
  };

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth <= 500;
  }

  ngOnInit(): void {
    this.employee = this.es.getEmployee();

    this.ds.request('GET', 'employee/payslips/latest').subscribe({
      next: (res: any) => {
        if(!res.data) { this.noPayslip = true; return; }

        this.payslip = res.data.payslip;
        this.position = res.data.position;
        this.rate = res.data.rate;
        this.payday_start = res.data.payday_start;
        this.payday_end = res.data.payday_end;
        this.released_at = res.data.released_at;
 
        for(let i = 0; i < this.payslip.attendance.types.length; i++) {
           const amount = parseFloat(this.payslip.attendance.amounts[i].replace(/[^\d.-]/g, ''));
           this.totals.attendance += amount;
           this.totals.gross += amount;
           this.totals.net_pay += amount;
         }
         
         for(let i = 0; i < this.payslip.allowance.types.length; i++) {
           const amount = parseFloat(this.payslip.allowance.amounts[i].replace(/[^\d.-]/g, ''));
           this.totals.other_earnings += amount;
           this.totals.gross += amount;
           this.totals.net_pay += amount;
         };
 
         for(let i = 0; i < this.payslip.deduction.types.length; i++) {
           const amount = parseFloat(this.payslip.deduction.amounts[i].replace(/[^\d.-]/g, ''));
           this.totals.deductions += amount;
           this.totals.total_deductions += amount;
           this.totals.net_pay -= amount;
         };
 
         for(let i = 0; i < this.payslip.other_deduction.types.length; i++) {
           const amount = parseFloat(this.payslip.other_deduction.amounts[i].replace(/[^\d.-]/g, ''));
           this.totals.other_deductions += amount;
           this.totals.total_deductions += amount;
           this.totals.net_pay -= amount;
         };
      },
      error: (err: any) => {
        this.pop.swalBasic('error', 'Oops!', err.error.message)
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  async downloadPDF() {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.getElementById('printSection'); // Get the div to convert
  
    if (!element) {
      console.error('Print section not found!');
      return;
    }
  
    const table = document.querySelector('.table-content') as HTMLElement;
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
  redirectToPayslipHistory() {
    this.router.navigate(['/employee/payslips/payslips-history']);
  }

}
