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
  payday_start = ''; payday_end = ''; base_pay = 0; adjusted_pay = 0; total_additions = 0; total_deductions = 0; gross_pay = 0; net_pay = 0; hourly_rate = 0;
  attendance: any = []; deductions: any = []; additions: any = [];
  values: any = [];
  employee: any;
  payslips: any = [];
  payslipDetails: any = [];
  

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth <= 500;
  }

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

  exportPayslipAsPDF(index: number) {
    const doc = new jsPDF();
    const payslip = this.payslips[index];
    const details = this.payslipDetails[index];
    const employee = this.employee;
  
    // Set font
    doc.setFont('helvetica', 'normal'); // Change font to Helvetica (you can customize this)
  
    // Add logo to the top-right
    const logoUrl = '/assets/images/gm18.png'; // Update this with the actual path or Base64 string
    const logoWidth = 30;
    const logoHeight = 30;
    doc.addImage(logoUrl, 'PNG', 170, 10, logoWidth, logoHeight);
  
    // Add company details to the top-left
    doc.setFontSize(12);
    doc.text('GM18 Driving School', 10, 15);
    doc.text('106 Gordon Avenue, New Kalalake, Olongapo City, Philippines 2200', 10, 22);
    doc.text('Tel No.: (047) 222-2446 / Cell No.: 0999 220 0158', 10, 29);
  
    // Employee details (same as before)
    doc.setFontSize(12);
    doc.text(`Name: ${employee.full_name}`, 10, 50);
    doc.text(`Position: ${employee.position}`, 200, 50, { align: 'right' });
    doc.text(`ID: ${employee.employee_id}`, 10, 58);
    doc.text(`Rate: ${employee.hourly_rate}`, 200, 58, { align: 'right' });
  
    doc.setFontSize(12);
    doc.text(`Payroll Period: ${details.payday_start} - ${details.payday_end}`, 105, 62, { align: 'center' });
  
    // Table Data with signs and peso signs removed
    const tableData = payslip.map((row: any) => [
      row[0], // Attendance Earnings
      row[1], // Hours
      row[2]?.replace(/[₱]/g, '').replace(/[+-]/g, ''), // Remove peso sign and any signs
      row[3], // Other Earnings
      row[4]?.replace(/[₱]/g, '').replace(/[+-]/g, ''), // Remove peso sign and any signs
      row[5], // Deductions
      row[6]?.replace(/[₱]/g, '').replace(/[+-]/g, ''), // Remove peso sign and any signs
    ]);
  
    // Add the totals as the last rows in the table
    tableData.push([
      'Adjusted Pay', 
      '', 
      ` ${details.adjusted_pay.replace(/[₱]/g, '').replace(/[+-]/g, '')}`, 
      'Total Additions', 
      ` ${details.total_additions.replace(/[₱]/g, '').replace(/[+-]/g, '')}`, 
      'Total Deductions', 
      ` ${details.total_deductions.replace(/[₱]/g, '').replace(/[+-]/g, '')}`
    ]);
  
    tableData.push([
      '', 
      '', 
      '', 
      'Gross Pay', 
      ` ${details.gross_pay.replace(/[₱]/g, '').replace(/[+-]/g, '')}`, 
      'Net Salary Transferred', 
      ` ${details.net_pay.replace(/[₱]/g, '').replace(/[+-]/g, '')}`
    ]);
  
    // Table Options
    const tableOptions = {
      head: [['Attendance Earnings', 'Hours', 'Amount', 'Other Earnings', 'Amount', 'Deductions', 'Amount']],
      body: tableData,
      startY: 75,
      margin: { left: 10, right: 10 },
      styles: {
        fontSize: 10,
        overflow: 'linebreak',
        cellPadding: 2,
        font: 'helvetica', // Apply Helvetica font
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Column 1 width
        1: { cellWidth: 20 }, // Column 2 width
        2: { cellWidth: 20, halign: 'center', charSpace: -0.1 }, // Amount column 1 (removed signs)
        3: { cellWidth: 30 }, // Column 4 width
        4: { cellWidth: 20, halign: 'center', charSpace: -0.1 }, // Amount column 2 (removed signs)
        5: { cellWidth: 40 }, // Column 6 width
        6: { cellWidth: 20, halign: 'center', charSpace: -0.1 }, // Amount column 3 (removed signs)
      },
    };
  
    // Generate Table
    const table = doc.autoTable(tableOptions);
  
    // Save the PDF
    const fileName = `Payslip_${employee.full_name}_${details.payday_start}_${details.payday_end}.pdf`;
    doc.save(fileName);
  }

  // get employee() {
  //   return this.as.getEmployee();
  // }

  redirectToPayslipHistory() {
    this.router.navigate(['/employee/payslips/payslips-history']);
  }

}
