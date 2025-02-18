import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../../services/data/data.service';
import { PopupService } from '../../../../../services/popup/popup.service';
import { EmployeeService } from '../../../../../services/employee/employee.service';

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

  ngOnInit(): void {
    this.employee = this.es.getEmployee();

    this.ds.request('GET', 'employee/payslips/history').subscribe({
      next: (res: any) => {
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

            /* For other deductions */
            // if(i >= payslip.deduction.types.length) {   
              
            //   let index = i - payslip.deduction.types.length;
            //   if(index < payslip.other_deduction.types.length) {
            //     col6 = payslip.other_deduction.types[index]    || '';
            //     col7 = payslip.other_deduction.amounts[index]  || '';
            //   }    
            // }

            /* Append subtypes */
            if(payslip.allowance.subtypes[i])
              col4 += ' ' + payslip.allowance.subtypes[i];

            if(payslip.deduction.subtypes[i])
              col6 += ' ' + payslip.deduction.subtypes[i];
            
            values.push([col1, col2, col3, col4, col5, col6, col7, col8, col9]);
          }          

          this.payslipDetails.push({
            rate             : element.rate,
            payday_start     : element.payday_start,
            payday_end       : element.payday_end,
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
    doc.text(`Rate: ${employee.rate}`, 200, 58, { align: 'right' });
  
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

  // get employee() {
  //   return this.as.getEmployee();
  // }

  clickTable(index: number) {
    if(this.activeTable == index && this.hasActive) this.hasActive = !this.hasActive;
    else { this.activeTable = index; this.hasActive = true; }
  }

  redirectToPayslip() {
    this.router.navigate(['/employee/payslips']);
  }
}
