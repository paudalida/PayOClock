import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { DataService } from '../../../../services/data/data.service';
import { AdminService } from '../../../../services/admin/admin.service';
import { PopupService } from '../../../../services/popup/popup.service';
import { AttendanceDetailPopupComponent } from './attendance-detail-popup/attendance-detail-popup.component';
import { ViewProofComponent } from './view-proof/view-proof.component';
import { AttendanceHistoryComponent } from './attendance-history/attendance-history.component';

export interface AttendanceRecord {
  name: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  [key: string]: string;
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  displayedColumns: string[] = ['name', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'proof'];
  dataSource: any;
  dates: any = [];

  dateRanges: string[] = [];
  selectedDateRange: string = '';

  constructor(
    private dialog: MatDialog,
    private paginatorIntl: MatPaginatorIntl,
    private changeDetectorRef: ChangeDetectorRef,
    private ds: DataService,
    private as: AdminService,
    private pop: PopupService
  ) { 
    const now = new Date();
    const currentDay = (now.getDay() + 6) % 7;  // Adjust to make Monday = 0, Sunday = 6
    const firstDay = new Date(now);             // Create a new date object to avoid mutation
    firstDay.setDate(now.getDate() - currentDay);
    
    // Generate date ranges
    this.generateDateRanges();

    for (let i = 0; i < 6; i++) {
      const newDate = new Date(firstDay);
      newDate.setDate(firstDay.getDate() + i);
      this.dates.push(newDate);
    }
  }

  isLoading = false;
  selectedDate = null;
  records: any = [];
  clockedIn: any = [];
  user_id: any;
  defaultRecord = {
    user_id: '',
    status: ''
  };

  get employees() {
    return this.as.getEmployees();
  }

  get employee() {
    return this.as.getEmployee();
  }

  setEmployeeID(data: any) {
    console.log(data)
    this.defaultRecord.user_id = data;
  }

  ngOnInit(): void {    
    this.isLoading = true;
    this.ds.request('GET', 'admin/attendance/weekly').subscribe({
      next: (res: any) => {

        this.employees.forEach((element: any) => {
          this.records.push(
            {
              id: element.id,
              name: element.full_name,
              mon: this.defaultRecord,
              tue: this.defaultRecord,
              wed: this.defaultRecord,
              thu: this.defaultRecord,
              fri: this.defaultRecord,
              sat: this.defaultRecord
            }
          );
        });

        res.data.forEach((element: any) => {
          let foundRecord = this.records.find((record: any) => record.id === element.user_id);
          foundRecord.user_id = element.user_id;

          switch(element.day) {
            case 'Monday':
              foundRecord.mon = element;
              break;

            case 'Tuesday':
              foundRecord.tue = element;
              break;

            case 'Wednesday':
              foundRecord.wed = element;
              break;

            case 'Thursday':
              foundRecord.thu = element;
              break;

            case 'Friday':
              foundRecord.fri = element;
              break;

            case 'Saturday':
              foundRecord.sat = element;
          }
        });

        this.dataSource = new MatTableDataSource(this.records);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err: any) => {

      },
      complete: () => { this.isLoading = false; }
    });
  }  

  generateDateRanges(): void {
    const startYear = new Date().getFullYear(); // Start from the current year
    const endYear = 2025; // End at December 2025
    let currentYear = startYear;
    let currentMonth = new Date().getMonth(); // Current month (0-based index)

    // Generate ranges until December 2025
    while (currentYear < endYear || (currentYear === endYear && currentMonth <= 11)) {
      let startDate = new Date(currentYear, currentMonth, 1); // Start of the current month
      let endDate = new Date(startDate); // Clone start date
      endDate.setDate(startDate.getDate() + 34); // Set end date 34 days ahead (total 35 days)

      // Format dates as MM/DD/YYYY
      const formattedStartDate = this.formatDate(startDate);
      const formattedEndDate = this.formatDate(endDate);
      const range = `${formattedStartDate} - ${formattedEndDate}`;
      this.dateRanges.push(range);

      // Move to the next range starting from the day after the current end date
      currentMonth = endDate.getMonth() + 1; // Move to the month after the current end date
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
    }

    // Set the default selection
    this.selectedDateRange = this.dateRanges[0];
  }

  formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  formatTime(time: string) {
    if(!time) return '';
    let hour = parseInt(time.slice(0, 2), 10);
    let ampm = 'AM';
    if(hour > 12) {
      hour = hour - 12;
      ampm = 'PM';
    }

    if(time.length > 5) time = time.slice(2, -3);
    else time = time.slice(2);

    return String(hour) + time + ' ' + ampm;    
  }

  getStatusClass(status: string): string {
    switch (status) {
        case 'present':
            return 'status-present';
        case 'late':
            return 'status-late';
        case 'absent':
            return 'status-absent';
        case 'leave':
            return 'status-leave';
        case 'paid-leave':
            return 'status-paid-leave';
        default:
            return 'status-default'; 
    }
  }

  openAttendanceDetail(date: any, day: string, data: any): void {
    this.selectedDate = date;
    if(!data.user_id) {
      data = this.defaultRecord;
    }

    const dialogRef = this.dialog.open(AttendanceDetailPopupComponent, {
      data: {
        selectedDate: date,
        selectedDay: day,
        details: data
      }
    });
  
    dialogRef.afterClosed().subscribe((res: any) => {
      if(res) {
        const index = this.dataSource.data.findIndex((employee: any) => (employee.id === res.user_id));
        if (index === -1) return;

        this.dataSource.data[index][res.day.slice(0,3).toLowerCase()] = res;
      }
    });
  }

  openAttendanceHistory() {
    if (this.dialog) {
      this.dialog.open(AttendanceHistoryComponent);
    } else {
      console.error('Dialog is not initialized');
    }
  }

  viewProof(data: any) {
    if (this.dialog) {
      this.dialog.open(ViewProofComponent, { data: data });
    } else {
      console.error('Dialog is not initialized');
    }
  }
}
