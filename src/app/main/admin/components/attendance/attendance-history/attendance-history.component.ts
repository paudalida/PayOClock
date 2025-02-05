import { Component, Inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AdminService } from '../../../../../services/admin/admin.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-attendance-history',
  templateUrl: './attendance-history.component.html',
  styleUrls: ['./attendance-history.component.scss']
})
export class AttendanceHistoryComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  employee: any;
  attendance: any;
  dates: any = [];
  groupedByWeek: any;
  groupedByPeriod: any;
  groupedByMonth: any;
  periods: any;
  weeks: any;
  months: any;
  weekFilter: any;
  periodFilter: any;
  monthFilter: any;
  typeFilter: any;
  dataSource: any = [];

  get employees() {
    return this.as.getEmployees();
  }

  constructor(
    private datePipe: DatePipe,
    private as: AdminService,
    private router: Router,
    public dialogRef: MatDialogRef<AttendanceHistoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.employee = data.employee;
    this.attendance = data.attendance;
  }

  colWithoutName = ['fullDate', 'timeIn', 'timeOut'];
  colWithName = ['name', 'fullDate', 'timeIn', 'timeOut'];
  displayedColumns: any = [];

  ngOnInit(): void {
    if(this.data.employee) {
      this.displayedColumns = this.colWithoutName;
      
      this.groupedByWeek = this.groupByWeek(this.data.attendance);
      this.groupedByPeriod = this.groupByPeriod(this.data.attendance, this.data.periods);
      this.groupedByMonth = this.groupByMonth(this.data.attendance);
      this.weeks = Object.keys(this.groupedByWeek);
      this.periods = Object.keys(this.groupedByPeriod);
      this.months = Object.keys(this.groupedByMonth)
      this.weekFilter = this.weeks[0];
      this.periodFilter = this.periods[0];
      this.monthFilter = this.months[0];
      this.typeFilter = 'period';

      this.dataSource = this.groupedByPeriod[this.periodFilter];
    }
    else {
      this.displayedColumns = this.colWithName;
      this.dataSource = this.data.attendance;
    }
  }

  changedFilter() {
    if(this.typeFilter == 'period') {
      this.dataSource = this.groupedByPeriod[this.periodFilter];
    } else if(this.typeFilter == 'month') {
      this.dataSource = this.groupedByMonth[this.monthFilter];
    } else if(this.typeFilter == 'week') {
      this.dataSource = this.groupedByWeek[this.weekFilter];
    }
  }

  groupByWeek(records: any[]) {
    return records.reduce((acc, record) => {
      const date = new Date(record.date);
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - (date.getDay() === 0 ? 6 : date.getDay() - 1)); // Monday start
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday end
  
      const key = `${startOfWeek.toISOString().split('T')[0].replace(/-/g, '/')} to ${endOfWeek.toISOString().split('T')[0].replace(/-/g, '/')}`;
  
      (acc[key] = acc[key] || []).push(record);
      return acc;
    }, {} as Record<string, any[]>);
  }

  groupByMonth(records: any[]) {
    return records.reduce((acc, record) => {
      const date = new Date(record.date);
  
      // Extract the month and year as the key
      const year = date.getFullYear();
      const month = date.toLocaleString('default', { month: 'long' });
      
      const key = `${month} ${year}`;  // Format as 'YYYY/MM'
  
      // Group records by month
      (acc[key] = acc[key] || []).push(record);
  
      return acc;
    }, {} as Record<string, any[]>);
  }
  
  groupByPeriod(records: any[], periods: any[]) {
    return records.reduce((acc, record) => {
      const recordDate = new Date(record.date);
  
      // Find the correct payroll period for the record
      const period = periods.find(p =>
        recordDate >= new Date(p.payday_start) && recordDate <= new Date(p.payday_end)
      );
  
      if (period) {
        const key = `${period.payday_start.replace(/-/g, '/')} to ${period.payday_end.replace(/-/g, '/')}`;
        (acc[key] = acc[key] || []).push(record);
      }
  
      return acc;
    }, {} as Record<string, any[]>);
  }

  convertTime(time: string): string {
    if(!time) return '-';
    // Assuming the time is in the format 'HH:mm:ss'
    const formattedTime = this.datePipe.transform(`1970-01-01T${time}`, 'h:mm a');
    return formattedTime || time;  // Return formatted time or original if formatting fails
  }

  downloadPDF(): void {
    const doc = new jsPDF();

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
  
    // Title
    doc.setFontSize(14);
    doc.text(`Daily Time Record - ${this.employee.name}`, 105, 40, { align: 'center' });

    // Table Headers
    const headers = [['Date', 'Time In', 'Time Out']];

    // Table Data
    const rows = this.attendance.map((record: any) => [
      this.formatFullDate(record.date),
      // record.status,
      this.convertTime(record.time_in),
      this.convertTime(record.time_out)
    ]);

    // AutoTable Options
    (doc as any).autoTable({
      head: headers,
      body: rows,
      startY: 50,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [0, 122, 204] }, // Header background color
      alternateRowStyles: { fillColor: [240, 240, 240] } // Alternate row color
    });

    // Save PDF
    doc.save(`DTR-${this.employee.name}.pdf`);
  }

  formatFullDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',  // Add the day name
      month: 'long', 
      day: '2-digit', 
      year: 'numeric'
    });
  }  

  closePopup() {
    this.dialogRef.close(); 
    this.router.navigate(['/admin/attendance']);
  }
}
