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
    
    for (let i = 0; i < 6; i++) {
      const newDate = new Date(firstDay);
      newDate.setDate(firstDay.getDate() + i);
      this.dates.push(newDate);
    }
  }

  isLoading = false;
  records: any = [];
  clockedIn: any = [];
  user_id: any;
  defaultRecord = {
    status: ''
  };

  get employees() {
    return this.as.getEmployees();
  }

  get employee() {
    return this.as.getEmployee();
  }

  setEmployee(data: any) {
    this.as.setEmployee(data);
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

  formatTime(time: string) {
    if(!time)
      return '';

    let hour = parseInt(time.slice(0, 2), 10);
    let ampm = 'AM';
    if(hour > 12) {
      hour = hour - 12;
      ampm = 'PM';
    }

    return String(hour) + time.slice(2, -3) + ' ' + ampm;    
  }

  timeBtnClick(action: string, id: string) {
    this.ds.request('POST', `admin/attendance/${action}/user/${id}`).subscribe({
      next: (res: any) => {
        this.pop.toastWithTimer('success', res.message);
        if(action == 'time-in') {
          this.clockedIn.push(id);
        } else if(action == 'time-out') {
          this.clockedIn.splice(this.clockedIn.indexOf(id), 1)
        }
      },
      error: (err: any) => {
        this.pop.toastWithTimer('error', 'err.error.message');
      }
    });
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

  updateAttendanceStatus(day: string, status: string, name: string): void {
    const index = this.dataSource.findIndex((employee: any) => employee.name === name);
    if (index === -1) return;
  
    const dayKey = day.toLowerCase() as keyof AttendanceRecord;
    this.dataSource[index][dayKey] = status;
  
    this.changeDetectorRef.detectChanges();
  }

  openAttendanceDetail(date: any, day: string, data: any): void {
    const dialogRef = this.dialog.open(AttendanceDetailPopupComponent, {
      data: {
        selectedDate: date,
        selectedDay: day,
        details: data
      }
    });
  
    // dialogRef.afterClosed().subscribe((res: any) => {
    //   if (res) {
    //     const index = this.dataSource.findIndex((employee: any) => (employee.id === this.employee.id));
    //     if (index === -1) return;
  
    //     console.log(res)
    //     switch(res.data.selectedDate) {

    //     }
        // const currentTime = new Date();
        // const eightAM = new Date();
        // eightAM.setHours(8, 0, 0);
        // const sixPM = new Date();
        // sixPM.setHours(18, 0, 0);
  
        // const dayKey = data.day.toLowerCase() as keyof AttendanceRecord;
  
        // if (result.timeIn) {
        //   const timeIn = new Date();
        //   timeIn.setHours(result.manualHour || 0, result.manualMinute || 0, 0);
          
        //   if (timeIn <= eightAM) {
        //     this.dataSource[index][dayKey] = 'present';
        //   } else if (timeIn > eightAM && timeIn < sixPM) {
        //     this.dataSource[index][dayKey] = 'late';
        //   } else if (timeIn >= sixPM) {
        //     this.dataSource[index][dayKey] = 'absent';
        //   }
        // } else if (result.leave) {
        //   this.dataSource[index][dayKey] = 'leave';
        // } else if (result.paidLeave) {
        //   this.dataSource[index][dayKey] = 'paid-leave';
        // } else if (!result.timeIn && currentTime >= sixPM) {
        //   this.dataSource[index][dayKey] = 'absent';
        // }


  
        // this.changeDetectorRef.detectChanges();
      // }
    // });
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
