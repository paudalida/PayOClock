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

  colWithoutName = ['fullDate', 'timeIn', 'timeOut', 'renderedHours'];
  colWithName = ['name', 'fullDate', 'timeIn', 'timeOut', 'renderedHours'];
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

  calculateRenderedHours(timeIn: string, timeOut: string): string {
    if (!timeIn || !timeOut) return '-';

    const parseTime = (timeStr: string): Date | null => {
      const [time, modifier] = timeStr.toLowerCase().split(' ');
      const [hoursStr, minutesStr] = time.split(':');
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);

      if (modifier === 'pm' && hours !== 12) hours += 12;
      if (modifier === 'am' && hours === 12) hours = 0;

      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    };

    const start = parseTime(timeIn);
    const end = parseTime(timeOut);

    if (!start || !end || end < start) return '-';

    let totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    // Subtract 1 hour for lunch if > 8 hours
    if (totalMinutes > 480) {
      totalMinutes -= 60;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    return `${hours}h ${minutes}m`;
  }

  calculateRenderedMinutes(timeIn: string, timeOut: string): number {
    if (!timeIn || !timeOut) return 0;

    const parseTime = (timeStr: string): Date | null => {
      const [time, modifier] = timeStr.toLowerCase().split(' ');
      const [hoursStr, minutesStr] = time.split(':');
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);

      if (modifier === 'pm' && hours !== 12) hours += 12;
      if (modifier === 'am' && hours === 12) hours = 0;

      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    };

    const start = parseTime(timeIn);
    const end = parseTime(timeOut);

    if (!start || !end || end < start) return 0;

    let totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    if (totalMinutes > 480) {
      totalMinutes -= 60;
    }

    return totalMinutes;
  }

  calculateTotalRendered(): string {
    let totalMinutes = 0;

    for (const record of this.dataSource) {
      totalMinutes += this.calculateRenderedMinutes(record.time_in, record.time_out);
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    return `${hours}h ${minutes}m`;
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
    if(this.employee) doc.text(`Attendance Records - ${this.employee.full_name}`, 105, 40, { align: 'center' });
    else doc.text(`Attendance Records - ${this.data.title}`, 105, 40, { align: 'center' });

    const formatTimeWithAmPm = (time: string): string => {
      if (!time) return 'N/A';
      const [hourStr, minuteStr] = time.split(':');
      if (!hourStr || !minuteStr) return time;

      let hour = parseInt(hourStr, 10);
      const minute = minuteStr;
      const ampm = hour >= 12 ? 'PM' : 'AM';

      hour = hour % 12;
      if (hour === 0) hour = 12;

      const hourFormatted = hour < 10 ? `0${hour}` : `${hour}`;

      return `${hourFormatted}:${minute} ${ampm}`;
    };

    const tableData = this.dataSource.map((record: any) => {
      const rendered = this.calculateRenderedHours(record.time_in, record.time_out);
      return [
        `${record.date}`,
        formatTimeWithAmPm(record.time_in),
        formatTimeWithAmPm(record.time_out),
        rendered
      ];
    });

    const totalMinutes = this.dataSource.reduce((acc: number, record: any) => {
      return acc + this.calculateRenderedMinutes(record.time_in, record.time_out);
    }, 0);

    const totalHours = Math.floor(totalMinutes / 60);
    const totalRemainingMinutes = Math.round(totalMinutes % 60);
    const totalRenderedFormatted = `${totalHours}h ${totalRemainingMinutes}m`;

    (doc as any).autoTable({
      head: [['Date', 'Time In', 'Time Out', 'No. of Rendered Hours']],
      body: tableData,
      foot: [['', '', 'Total Hours Rendered:', totalRenderedFormatted]],
      startY: 50,
      margin: { left: 10, right: 10 },
      styles: { fontSize: 10, cellPadding: 2, font: 'helvetica' },
      headStyles: { halign: 'center' },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' }
      },
      footStyles: {
        fontStyle: 'bold',
        halign: 'center'
      }
    });

    // Save PDF
    if(this.employee) doc.save(`DTR-${this.employee.full_name}.pdf`);
    else doc.save(`Attendance-${this.data.title}.pdf`);
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
  }
}
