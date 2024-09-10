import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { DataService } from '../../../../services/data/data.service';
import { AdminService } from '../../../../services/admin/admin.service';
import { PopupService } from '../../../../services/popup/popup.service';
import { ViewProofComponent } from './view-proof/view-proof.component';


export interface AttendanceRecord {
  name: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

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

  displayedColumns: string[] = ['name', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'proof'];
  dataSource: AttendanceRecord[] = [];
 

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
      default:
        return '';
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
