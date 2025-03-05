import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { AdminService } from '../../../../services/admin/admin.service';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../../../../services/data/data.service';

import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { AttendanceHistoryComponent } from '../attendance/attendance-history/attendance-history.component';

import jsPDF from 'jspdf';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, AfterViewInit {
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('payrollPaginator') payrollPaginator!: MatPaginator;  

  displayedColumns: string[] = ['employee_id', 'name', 'gender', 'position', 'action'];
  dataSource = new MatTableDataSource<any>();
  payrollDataSource = new MatTableDataSource<any>();

  // attendance: any;
  // payrollPeriods: any;

  attendanceTypeFilter = 'week';
  attendanceDatesFilter = '';
  attendance: any[] = [];
  leaves: any[] = [];
  payrollPeriods: any[] = [];
  weeks: any = [];
  months: any = [];
  years: any = [];
  groupedRecordsByPeriods: any = [];
  groupedRecordsByWeek: any = [];
  groupedRecordsByMonth: any = [];
  groupedRecordsByYear: any = [];
  periodFilter: any[] = [];
  currFilter: any;
  columns: any;
  isLoading = false;
  // payrollPaginator: any;

  constructor(
    private as: AdminService,
    private dialog: MatDialog, 
    private ds: DataService,
    private paginatorIntl: MatPaginatorIntl,
    private changeDetectorRef: ChangeDetectorRef,
    private datePipe: DatePipe,
  ) {
    this.paginator = new MatPaginator(this.paginatorIntl, this.changeDetectorRef);
  }

  setEmployee(data: any) {
    this.as.setEmployee(data);
  } 

  get employees() {
    return this.as.getEmployees();
  }

  ngOnInit(): void {
    this.getData();
    this.fetchAttendanceData();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
        this.dataSource.paginator = this.paginator;
    }
    if (this.payrollPaginator) {
        this.payrollDataSource.paginator = this.payrollPaginator;
    }
    this.dataSource.sort = this.sort;
    this.payrollDataSource.sort = this.sort;
  }

  protected getData() {
    const employees = this.as.getEmployees();
    this.dataSource.data = employees; // DTR Table
    this.payrollDataSource.data = employees; // Payroll Table
  }


  protected setupTableFunctions() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  fetchAttendanceData(): void {
    this.isLoading = true;
    this.ds.request('GET', 'admin/attendance').subscribe({
      next: (res: any) => {
        this.attendance = res.data.attendance;
        this.leaves = res.data.leaves;
        this.payrollPeriods = res.data.payroll_periods;
        this.groupedRecordsByWeek = (this.groupBy(res.data.attendance, 'week'));
        this.groupedRecordsByMonth = this.groupBy(res.data.attendance, 'month');
        this.groupedRecordsByYear = this.groupBy(res.data.attendance, 'year');
        this.weeks = Object.keys(this.groupedRecordsByWeek);
        this.months = Object.keys(this.groupedRecordsByMonth);
        this.years = Object.keys(this.groupedRecordsByYear);
        this.periodFilter = this.combinePayrollPeriods(res.data.payroll_periods);
        this.currFilter = this.periodFilter[0];
        this.attendanceDatesFilter = this.weeks[0];
      },
      error: (err: any) => {
        console.error('Error fetching attendance data:', err);
      },
      complete: () => { 
        this.isLoading = false; 
      }
    });
  }

  groupBy(attendanceData: any[], type: 'day' | 'week' | 'month' | 'year'): any {
    return attendanceData.reduce((acc: any, record: any) => {
        const date = new Date(record.date);
        let key: string;

        switch (type) {
            case 'day':
                key = date.toISOString().split('T')[0]; // YYYY-MM-DD
                break;
            case 'week':
                const { startOfWeek, endOfWeek } = this.getWeekRange(date);
                key = `${startOfWeek} - ${endOfWeek}`; // YYYY-MM-DD - YYYY-MM-DD
                break;
            case 'month':
                key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`; // YYYY-MM
                break;
            case 'year':
                key = date.getFullYear().toString(); // YYYY
                break;
            default:
                throw new Error('Invalid grouping type');
        }

        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(record);
        return acc;
    }, {});
  }

  // Helper function to get the start and end dates of a given week
  getWeekRange(date: Date): { startOfWeek: string, endOfWeek: string } {
      const tempDate = new Date(date);
      const dayOfWeek = tempDate.getDay(); // 0 (Sunday) to 6 (Saturday)

      // Assuming weeks start on Monday
      const startOfWeek = new Date(tempDate);
      startOfWeek.setDate(tempDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Adjust if Sunday

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week

      return {
          startOfWeek: startOfWeek.toISOString().split('T')[0],
          endOfWeek: endOfWeek.toISOString().split('T')[0]
      };
  }

  combinePayrollPeriods(payrollPeriods: any[]): any[] {
    return payrollPeriods.map(period => period.name);
  }

  getDateRangeFromString(period: string): { startDate: string, endDate: string } {
    const dates = period.split(' to ');
    return { startDate: dates[0], endDate: dates[1] };
  }

  openDTRPopup(employee: any, filter?: string): void {
    let attendanceData: any = [];
    let title = filter;

    if(employee) {
      attendanceData = this.attendance.filter((data: any) => data.user_id === employee.id);
      title = employee.full_name;
    } else {      
      attendanceData = this.attendance.filter((element: any) => element.date == filter);

      attendanceData.forEach((element: any) => {
        element.name = this.as.getEmployees().find((employee: any) => employee.id == element.user_id).full_name;
      });
    }
    const dialogRef = this.dialog.open(AttendanceHistoryComponent, {
      width: '600px',
      data: { 
        title: title,
        employee: employee,
        periods: this.payrollPeriods,
        attendance: attendanceData
      }
    });
  }

  downloadAttendance(employee?: any): void {
    let data = [];
    switch(this.attendanceTypeFilter) {
      case 'week': 
        data = this.groupedRecordsByWeek[this.attendanceDatesFilter];
        break;

      case 'month':
        data = this.groupedRecordsByMonth[this.attendanceDatesFilter];
        break;

      case 'year':
        data = this.groupedRecordsByYear[this.attendanceDatesFilter];
        break;
    }

    if(employee) {
      data = data.filter((element: any) => element.user_id === employee.id);
    } else {
      data.forEach((element: any) => {
        const emp = this.employees.find((empElement: any) => element.user_id === empElement.id);
        element.name = emp.full_name;
      });
    }

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
    if(employee) doc.text(`Attendance Records - ${employee.full_name}`, 105, 40, { align: 'center' });
    else doc.text(`Attendance Records - ${this.attendanceDatesFilter}`, 105, 40, { align: 'center' });

    // Table Headers
    let headers: any = [];
    if(employee) headers = [['Date', 'Time In', 'Time Out']];
    else headers = [['Name', 'Date', 'Time In', 'Time Out']];

    // Table Data
    let rows: any = [];
    if(employee) {
      rows = data.map((record: any) => [
        this.formatFullDate(record.date),
        this.convertTime(record.time_in),
        this.convertTime(record.time_out)
      ]);
    } else {
      rows = data.map((record: any) => [
        record.name,
        this.formatFullDate(record.date),
        this.convertTime(record.time_in),
        this.convertTime(record.time_out)
      ]);
    }

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
    if(employee) doc.save(`Attendance-${employee.full_name}.pdf`);
    else doc.save(`Attendance-${this.attendanceDatesFilter}.pdf`);
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

  convertTime(time: string): string {
    if(!time) return '-';
    // Assuming the time is in the format 'HH:mm:ss'
    const formattedTime = this.datePipe.transform(`1970-01-01T${time}`, 'h:mm a');
    return formattedTime || time;  // Return formatted time or original if formatting fails
  }
}
