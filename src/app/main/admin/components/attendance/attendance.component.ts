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
  dayNames = [ 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ];

  dateRanges: string[] = [];
  selectedDateRange: string = '';

  constructor(
    private dialog: MatDialog,
    private paginatorIntl: MatPaginatorIntl,
    private changeDetectorRef: ChangeDetectorRef,
    private ds: DataService,
    private as: AdminService,
    private pop: PopupService
  ) { }

  isLoading = false;
  current = '';
  selectedDate = null;
  clockedIn: any = [];
  user_id: any;
  attendanceWeeks: any;
  attendance: any;
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
    this.defaultRecord.user_id = data;
  }

  ngOnInit(): void {    
    this.isLoading = true;
    this.ds.request('GET', 'admin/attendance').subscribe({
      next: (res: any) => {
        this.attendance = res.data.records;
        this.attendanceWeeks = Object.keys(this.attendance);
        this.generateDateRange(this.attendanceWeeks[this.attendanceWeeks.length-1]);
        this.formatData(this.attendance[this.attendanceWeeks[this.attendanceWeeks.length - 1]]);

        this.current = res.data.currentDay;

        this.selectedDateRange = this.attendanceWeeks[this.attendanceWeeks.length-1];
      },
      error: (err: any) => {

      },
      complete: () => { this.isLoading = false; }
    });
  }  

  formatData(data: any) {
    let records: any = [];
    this.employees.forEach((element: any) => {
      records.push(
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

    data.forEach((element: any) => {
      let foundRecord = records.find((record: any) => record.id === element.user_id);
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

    this.dataSource = new MatTableDataSource(records);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  generateDateRange(key: string) {
    const [start, end] = key.split(' - ').map(date => new Date(date));
    const dates: string[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const year = d.getFullYear();

      dates.push(`${year}-${month}-${day}`);
    }

    this.dates = dates;
  }

  dateFilter(event: Event) {
    const date = (event.target as HTMLSelectElement).value
    this.formatData(this.attendance[date]);
    this.generateDateRange(date);
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

  getStatusClass(status: string, day: string): string {
    if(this.selectedDateRange == this.attendanceWeeks[this.attendanceWeeks.length - 1]) {
      if(this.dayNames.indexOf(day) <= this.dayNames.indexOf(this.current) && day != 'sat') {
        if(status == '') status = 'absent';
      }
    } else {
      if(status == '' && day != 'sat') status = 'absent';
    }
    
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
    let proof = [];

    /* Improve */
    if(data.mon.status) {
      // if(data.mon.images.length > 0) {
        proof.push(data.mon);
      // }
    }
   
    if(data.tue.status) {
      // if(data.tue.images.length > 0) {
        proof.push(data.tue);
      // }
    }

    if(data.wed.status) {
      // if(data.wed.images.length > 0) {
        proof.push(data.wed);
      // }
    }
    
    if(data.thu.status) {
      // if(data.thu.images.length > 0) {
        proof.push(data.thu);
      // }
    }
    
    if(data.fri.status) {
      // if(data.fri.images.length > 0) {
        proof.push(data.fri);
      // }
    }
    
    if(data.sat.status) {
      // if(data.sat.images.length > 0) {
        proof.push(data.sat);
      // }
    }

    if (this.dialog) {
      this.dialog.open(ViewProofComponent, { data: proof });
    } else {
      console.error('Dialog is not initialized');
    }
  }

  isBeforeOrNow(date: string) {
    const date2 = '2024-11-01';

    // Convert the string dates to Date objects
    const parsedDate1 = new Date(date);
    const parsedDate2 = new Date(date2);

    // Compare the dates
    return parsedDate1 <= parsedDate2;

  }
}
