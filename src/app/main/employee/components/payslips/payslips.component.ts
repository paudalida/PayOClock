import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../services/data/data.service';
import { PopupService } from '../../../../services/popup/popup.service';
import { EmployeeService } from '../../../../services/employee/employee.service';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  payday_start = ''; payday_end = ''; base_pay = 0; adjusted_pay = 0; total_additions = 0; total_deductions = 0; gross_pay = 0; net_pay = 0; rate = 0;
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
        this.rate = res.data.rate;
        this.payday_start = res.data.payday_start;
        this.payday_end = res.data.payday_end;
 
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

  exportPayslipAsPDF(index: number) {
    const doc = new jsPDF();
    const payslip = this.payslips[index] || [];
    const details = this.payslipDetails[index] || {};
    const employee = this.employee || {};
  
    // Set font
    doc.setFont('helvetica', 'normal');
  
    const logoUrl = '/assets/images/gm18.png';
    const logoWidth = 30, logoHeight = 30;
    try {
      doc.addImage(logoUrl, 'PNG', 170, 10, logoWidth, logoHeight);
    } catch (error) {
      console.warn('Logo could not be loaded:', error);
    }
  
    // Company details
    doc.setFontSize(12);
    doc.text('GM18 Driving School', 10, 15);
    doc.text('106 Gordon Avenue, New Kalalake, Olongapo City, Philippines 2200', 10, 22);
    doc.text('Tel No.: (047) 222-2446 / Cell No.: 0999 220 0158', 10, 29);
  
    // Employee details
    doc.text(`Name: ${employee.full_name || 'N/A'}`, 10, 50);
    doc.text(`Position: ${employee.position || 'N/A'}`, 200, 50, { align: 'right' });
    doc.text(`ID: ${employee.employee_id || 'N/A'}`, 10, 58);
    doc.text(`Rate: ${employee.hourly_rate || 'N/A'}`, 200, 58, { align: 'right' });
  
    doc.text(`Payroll Period: ${details.payday_start || 'N/A'} - ${details.payday_end || 'N/A'}`, 105, 62, { align: 'center' });
  
    // Table Data
    const tableData = payslip.map((row: any) => [
      row[0] || '', 
      row[1] || '', 
      (row[2] || '').replace(/[₱]/g, '').replace(/[+-]/g, ''),
      row[3] || '', 
      (row[4] || '').replace(/[₱]/g, '').replace(/[+-]/g, ''),
      row[5] || '', 
      (row[6] || '').replace(/[₱]/g, '').replace(/[+-]/g, '')
    ]);
  
    tableData.push([
      'Adjusted Pay', '', `${details.adjusted_pay || '0'}`, 
      'Total Additions', `${details.total_additions || '0'}`, 
      'Total Deductions', `${details.total_deductions || '0'}`
    ]);
  
    tableData.push([
      '', '', '', 
      'Gross Pay', `${details.gross_pay || '0'}`, 
      'Net Salary Transferred', `${details.net_pay || '0'}`
    ]);
  
    // Table Options
    (doc as any).autoTable({
      head: [['Attendance Earnings', 'Hours', 'Amount', 'Other Earnings', 'Amount', 'Deductions', 'Amount']],
      body: tableData,
      startY: 75,
      margin: { left: 10, right: 10 },
      styles: { fontSize: 10, cellPadding: 2, font: 'helvetica' },
      columnStyles: { 2: { halign: 'center' }, 4: { halign: 'center' }, 6: { halign: 'center' } }
    });
    
  
    // Save PDF
    const fileName = `Payslip_${employee.full_name || 'Unknown'}_${details.payday_start || 'Unknown'}_${details.payday_end || 'Unknown'}.pdf`;
    doc.save(fileName);
  }

  // get employee() {
  //   return this.as.getEmployee();
  // }

  redirectToPayslipHistory() {
    this.router.navigate(['/employee/payslips/payslips-history']);
  }

}
