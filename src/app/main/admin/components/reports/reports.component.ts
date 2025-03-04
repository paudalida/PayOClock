import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { AdminService } from '../../../../services/admin/admin.service';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../../../../services/data/data.service';

import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { AttendanceHistoryComponent } from '../attendance/attendance-history/attendance-history.component';

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

  attendance: any[] = [];
  leaves: any[] = [];
  payrollPeriods: any[] = [];
  groupedRecordsByDay: any = {};
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
        this.groupedRecordsByDay = this.groupByDay(res.data.attendance);
        this.periodFilter = this.combinePayrollPeriods(res.data.payroll_periods);
        this.currFilter = this.periodFilter[0];
        this.columns = this.getDateRangeFromString(this.currFilter);
      },
      error: (err: any) => {
        console.error('Error fetching attendance data:', err);
      },
      complete: () => { 
        this.isLoading = false; 
      }
    });
  }

  groupByDay(attendanceData: any[]): any {
    return attendanceData.reduce((acc: any, record: any) => {
      const date = record.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(record);
      return acc;
    }, {});
  }

  combinePayrollPeriods(payrollPeriods: any[]): any[] {
    return payrollPeriods.map(period => period.name);
  }

  getDateRangeFromString(period: string): { startDate: string, endDate: string } {
    const dates = period.split(' to ');
    return { startDate: dates[0], endDate: dates[1] };
  }

  // viewDetails() {
  //   if (this.dialog) {
  //     this.dialog.open(AttendanceHistoryComponent);
  //   } else {
  //     console.error('Dialog is not initialized');
  //   }
  // }

  openDTRPopup(employee: any, filter?: string): void {
    let attendanceData: any = [];
    let title = filter;

    if(employee) {
      attendanceData = this.attendance.filter((data: any) => data.user_id === employee.id);
      title = employee.full_name;
    } else {      
      attendanceData = this.attendance.filter((element: any) => element.date == filter);

      attendanceData.forEach((element: any) => {
        element.name = this.employees.find((employee: any) => employee.id == element.user_id).full_name;
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

  downloadRecord(employee: any) {
    alert(`Downloading DTR for ${employee.first_name} ${employee.last_name}`);
  }
}
