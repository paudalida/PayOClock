import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
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

  displayedColumns: string[] = ['name', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'proof'];
  dataSource: AttendanceRecord[] = [];

  constructor(
    private dialog: MatDialog,
    private paginatorIntl: MatPaginatorIntl,
    private changeDetectorRef: ChangeDetectorRef,
    private ds: DataService,
    private as: AdminService,
    private pop: PopupService
  ) { }

  paginatorIndex = 0;
  paginatorCount = 5;
  attendance: any = null;
  clockedIn: any = [];

  get employees() {
    return this.as.getEmployees();
  }

  ngOnInit(): void {
    this.ds.request('GET', 'admin/attendance/today').subscribe((res:any) => {
      this.attendance = res.data;
      if(this.attendance) {
        this.attendance.forEach((element: any) => {
          if(!(element.leave_type || element.time_out))
            this.clockedIn.push(element.user_id);
        });
      }
    })
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

  /* Paginator functions */
  changePaginator(event: Event) {
    const count = (event.target as HTMLSelectElement).value;
    this.paginatorCount = Number(count);
    this.paginatorIndex = 0;
  }

  first() {
    this.paginatorIndex = 0;
  }

  next() {
    if((this.paginatorIndex + this.paginatorCount) < this.employees.length)
      this.paginatorIndex += this.paginatorCount;
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
    const index = this.dataSource.findIndex(employee => employee.name === name);
    if (index === -1) return;
  
    const dayKey = day.toLowerCase() as keyof AttendanceRecord;
    this.dataSource[index][dayKey] = status;
  
    this.changeDetectorRef.detectChanges();
  }

  openAttendanceDetail(day: string, status: string, name: string): void {
    const dialogRef = this.dialog.open(AttendanceDetailPopupComponent, {
      data: { day, status, name }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.dataSource.findIndex(employee => employee.name === name);
        if (index === -1) return;
  
        const currentTime = new Date();
        const eightAM = new Date();
        eightAM.setHours(8, 0, 0);
        const sixPM = new Date();
        sixPM.setHours(18, 0, 0);
  
        const dayKey = day.toLowerCase() as keyof AttendanceRecord;
  
        if (result.timeIn) {
          const timeIn = new Date();
          timeIn.setHours(result.manualHour || 0, result.manualMinute || 0, 0);
          
          if (timeIn <= eightAM) {
            this.dataSource[index][dayKey] = 'present';
          } else if (timeIn > eightAM && timeIn < sixPM) {
            this.dataSource[index][dayKey] = 'late';
          } else if (timeIn >= sixPM) {
            this.dataSource[index][dayKey] = 'absent';
          }
        } else if (result.leave) {
          this.dataSource[index][dayKey] = 'leave';
        } else if (result.paidLeave) {
          this.dataSource[index][dayKey] = 'paid-leave';
        } else if (!result.timeIn && currentTime >= sixPM) {
          this.dataSource[index][dayKey] = 'absent';
        }
  
        this.changeDetectorRef.detectChanges();
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

  viewProof() {
    if (this.dialog) {
      this.dialog.open(ViewProofComponent);
    } else {
      console.error('Dialog is not initialized');
    }
  }
}
