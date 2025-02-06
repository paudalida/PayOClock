import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopupService } from '../../../../services/popup/popup.service';
import { DataService } from '../../../../services/data/data.service';
import { EmployeeService } from '../../../../services/employee/employee.service';
import { DatePipe } from '@angular/common';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {

  constructor(
    private datePipe: DatePipe,
    private ds: DataService,
    private pop: PopupService,
    private es: EmployeeService,
  ) {}

  isTimedIn: boolean = false;
  buttonLoading = false;
  attendance: any[] = [];
  formattedAttendance: any[] = [];
  employee: any;
  currentMonthYear: string = '';
  currentTime: string = '';
  currentDate: string = '';
  accumulatedHours: any;
  dateFilter: any = null;
  filterValue = '';
  columns: any;
  payrolls: any = null;
  payroll: any = null;
  release_date: string = '';
  release_dates: any = [];

  /* Kay Chaws */
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
  dataSource: any;

  hoursToggle: boolean = false;

  toggleHours() {
    this.hoursToggle = !this.hoursToggle;
  }

  ngOnInit(): void {
    this.updateCurrentMonthYear();
    this.employee = this.es.getEmployee();
    this.calculateAccumulatedHours();
    this.buttonLoading = true;

    this.ds.request('GET', 'employee/attendance').subscribe({
      next: (res: any) => {
        this.attendance = res.data.attendance;
        if(this.attendance[0].time_in && !this.attendance[0].time_out) this.isTimedIn = true;

        this.groupedByWeek = this.groupByWeek(res.data.attendance);
        this.groupedByPeriod = this.groupByPeriod(res.data.attendance, res.data.payroll_periods);
        this.groupedByMonth = this.groupByMonth(res.data.attendance);
        this.weeks = Object.keys(this.groupedByWeek);
        this.periods = Object.keys(this.groupedByPeriod);
        this.months = Object.keys(this.groupedByMonth);
        this.weekFilter = this.weeks[0];
        this.periodFilter = this.periods[0];
        this.monthFilter = this.months[0];
        this.typeFilter = 'period';
        this.dataSource = this.groupedByPeriod[this.periodFilter];
      },
      error: (err: any) => {
        this.pop.swalBasic('error', this.pop.genericErrorTitle, err.error.message);
      },
      complete: () => { this.buttonLoading = false; }
    });

    this.ds.request('GET', 'employee/attendance/hours').subscribe({
      next: (res: any) => {
        this.accumulatedHours = res.data;
      }
    })
    this.updateDateTime();
    setInterval(() => {
      this.updateDateTime();
    }, 1000);
  }

  changeData() {
    if(this.typeFilter == 'week') {
      this.filterValue = this.weekFilter;
      this.dataSource = this.groupedByWeek[this.filterValue];
    } else if(this.typeFilter == 'period') {
      this.filterValue = this.periodFilter;
      this.dataSource = this.groupedByPeriod[this.filterValue];
    } else if(this.typeFilter == 'month') {
      this.filterValue = this.monthFilter;
      this.dataSource = this.groupedByMonth[this.filterValue];
    }
  }

  convertTime(time: string): string {
    if(!time) return '-';
    // Assuming the time is in the format 'HH:mm:ss'
    const formattedTime = this.datePipe.transform(`1970-01-01T${time}`, 'h:mm a');
    return formattedTime || time;  // Return formatted time or original if formatting fails
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

  updateCurrentMonthYear() {
    const now = new Date();
    this.currentMonthYear = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }  

  formatAttendanceData() {
    if (!this.attendance.length) return;

    this.formattedAttendance = this.attendance.map(record => {
      const dateObj = new Date(record.time_in || record.time_out || new Date());
      const monthYear = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
      const day = dateObj.toLocaleString('default', { weekday: 'long' });
      const date = dateObj.toLocaleDateString();

      this.currentMonthYear = monthYear;

      return {
        date,
        day,
        time_in: record.time_in ? new Date(record.time_in).toLocaleTimeString() : null,
        time_out: record.time_out ? new Date(record.time_out).toLocaleTimeString() : null
      };
    });
    this.calculateAccumulatedHours();
  }

  updateDateTime(): void {
    const now = new Date();

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    };

    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    };

    const timePart = now.toLocaleTimeString('en-US', timeOptions);
    const datePart = now.toLocaleDateString('en-US', dateOptions);
  
    // this.currentDateTime = `${datePart}, ${timePart}`;

    this.currentTime = timePart;
    this.currentDate = datePart;
  }

  getData() {
    this.ds.request('GET', 'employee/attendance').subscribe({
      next: (res: any) => {
        this.groupedByWeek = this.groupByWeek(res.data.attendance);
        this.groupedByPeriod = this.groupByPeriod(res.data.attendance, res.data.payroll_periods);
        this.groupedByMonth = this.groupByMonth(res.data.attendance);
        this.weeks = Object.keys(this.groupedByWeek);
        this.periods = Object.keys(this.groupedByPeriod);
        this.months = Object.keys(this.groupedByMonth)
        this.weekFilter = this.weeks[0];
        this.periodFilter = this.periods[0];
        this.monthFilter = this.months[0];
      },
      error: (err: any) => {
        this.pop.swalBasic('error', 'Oops! Cannot fetch payrolls!', this.pop.genericErrorMessage);
      }
    });
  }
  
  changedFilter() {
    this.payroll = this.payrolls[this.filterValue]
    this.release_date = this.release_dates[this.filterValue]
  }  
 
  toggleTime() {
    this.buttonLoading = true;
  
    this.ds.request('POST', 'employee/attendance/clock').subscribe({
      next: (res: any) => {
        this.pop.toastWithTimer('success', res.message);

        if(this.isTimedIn) {
          let index = this.attendance.findIndex((element: any) => element.id == res.data.id);
          if (index !== -1) this.attendance[index] = res.data;
          this.groupedByWeek = this.groupByWeek(this.attendance);
          this.groupedByPeriod = this.groupByPeriod(this.attendance, res.data.payroll_periods);
          this.groupedByMonth = this.groupByMonth(this.attendance);
        } else {
          this.attendance.unshift(res.data);
          this.groupedByWeek = this.groupByWeek(this.attendance);
          this.groupedByPeriod = this.groupByPeriod(this.attendance, res.data.payroll_periods);
          this.groupedByMonth = this.groupByMonth(this.attendance);
        }      
        this.isTimedIn = !this.isTimedIn;
        this.changeData();
      },
      error: (err: any) => {
        this.pop.swalBasic('error', this.pop.genericErrorTitle, err.error.message);
      },
      complete: () => {
        this.buttonLoading = false;
      }
    });
  }
  
  exportAttendanceAsPDF() {
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
    doc.text('Attendance Records', 105, 40, { align: 'center' });
  
    // Table Data
    const tableData = this.dataSource.map((record: any) => [
      `${record.date}`,
      record.time_in || 'N/A',
      record.time_out || 'N/A'
    ]);
  
    // Table Options
    (doc as any).autoTable({
      head: [['Date', 'Time In', 'Time Out']],
      body: tableData,
      startY: 50,
      margin: { left: 10, right: 10 },
      styles: { fontSize: 10, cellPadding: 2, font: 'helvetica' },
      headStyles: { halign: 'center' },
      columnStyles: { 0: { halign: 'center' }, 1: { halign: 'center' }, 2: { halign: 'center' } }
    });
  
    // Save PDF
    const fileName = `Attendance_Records_${new Date().toLocaleDateString()}.pdf`;
    doc.save(fileName);
  }
  
  calculateAccumulatedHours() {
    let totalMinutes = 0;
  
    this.attendance.forEach(record => {
      if (record.time_in && record.time_out) {
        const timeIn = new Date(record.time_in);
        const timeOut = new Date(record.time_out);
  
        if (!isNaN(timeIn.getTime()) && !isNaN(timeOut.getTime())) {
          const diffMinutes = (timeOut.getTime() - timeIn.getTime()) / (1000 * 60);
          totalMinutes += diffMinutes;
        }
      }
    });
  
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    this.accumulatedHours = `${hours}h ${minutes}m`;
  }
}
