import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../../services/admin/admin.service';
import { Router } from '@angular/router';
import { DataService } from '../../../../../services/data/data.service';
import { PopupService } from '../../../../../services/popup/popup.service';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

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


  exportPayslipAsPDF(index: number) {
    const doc = new jsPDF();
    const payslip = this.payslips[index];
    const details = this.payslipDetails[index];
    const employee = this.employee;
  
    // Add logo to the top-right
    const logoUrl = '/assets/images/gm18.png'; // Update this with the actual path or Base64 string
    const logoWidth = 30; // Adjust the size as needed
    const logoHeight = 30;
    doc.addImage(logoUrl, 'PNG', 170, 10, logoWidth, logoHeight); 
  
    // Add company details to the top-left
    doc.setFontSize(12);
    doc.text('GM18 Driving School', 10, 15);
    doc.text('106 Gordon Avenue, New Kalalake, Olongapo City, Philippines 2200', 10, 20);
    doc.text('Olongapo City, Philippines 2200', 10, 25);
    doc.text('Tel No.: (047) 222-2446 / Cell No.: 0999 220 0158', 10, 30);
  
    // Header - Title
    // doc.setFontSize(16);
    // doc.setFont('bold');
    // doc.text('PAYSLIP', 105, 90, { align: 'center' });
  
    doc.setFontSize(12);;
    doc.text(`Name: ${employee.full_name}`, 10, 70); // First row
    doc.text(`Position: ${employee.position}`, 198, 70, { align: 'right' });
  
    doc.text(`ID: ${employee.employee_id}`, 10, 78); // Second row
    doc.text(`Rate: ${employee.hourly_rate}`, 198, 78, { align: 'right' });
  
    doc.text(`Payroll Period: ${details.payday_start} - ${details.payday_end}`, 105, 86, { align: 'center' });
    doc.setFont('bold');

    // Table Data
    const tableData = payslip.map((row: any) => [
      row[0], // Attendance Earnings
      row[1], // Hours
      row[2], // Amount
      row[3], // Other Earnings
      row[4], // Amount
      row[5], // Deductions
      row[6], // Amount
    ]);
  
    const tableOptions = {
      head: [['Attendance Earnings', 'Hours', 'Amount', 'Other Earnings', 'Amount', 'Deductions', 'Amount']],
      body: tableData,
      startY: 110, 
      columnStyles: {
        0: { cellWidth: 40 }, // Column 1 width
        1: { cellWidth: 20 }, // Column 2 width
        2: { cellWidth: 30 }, // Column 3 width
        3: { cellWidth: 40 }, // Column 4 width
        4: { cellWidth: 30 }, // Column 5 width
        5: { cellWidth: 40 }, // Column 6 width
        6: { cellWidth: 30 }, // Column 7 width
      },
      
    };
    doc.autoTable(tableOptions);
  
    // Generate Table and Get the Y-Position After the Table
    const table = doc.autoTable(tableOptions);
  
    // Totals Summary - Position Below Table
    const finalY = table.lastAutoTable.finalY || table.finalY; // Handle different plugin versions
    doc.text(`Adjusted Pay: ${details.adjusted_pay}`, 10, finalY + 10);
    doc.text(`Total Additions: ${details.total_additions}`, 10, finalY + 20);
    doc.text(`Total Deductions: ${details.total_deductions}`, 10, finalY + 30);
    doc.text(`Gross Pay: ${details.gross_pay}`, 10, finalY + 40);
    doc.text(`Net Salary Transferred: ${details.net_pay}`, 10, finalY + 50);
  
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
    this.paginatorIndex = 1;
  }

  next() {
    if (this.paginatorIndex + this.paginatorCount < this.payslips.length) {
      this.paginatorIndex += this.paginatorCount;
    }
  }

  previous() {
    if (this.paginatorIndex - this.paginatorCount >= 0) {
      this.paginatorIndex -= this.paginatorCount;
    }
  }

  last() {
    const length = this.payslips.length;
    const excess = (length % this.paginatorCount) == 0 ? (this.paginatorCount) : (length % this.paginatorCount);
    this.paginatorIndex = length - excess+1;
  }
}

