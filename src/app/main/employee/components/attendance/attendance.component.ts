import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { PopupService } from '../../../../services/popup/popup.service';
import { DataService } from '../../../../services/data/data.service';

import { UploadProofComponent } from './upload-proof/upload-proof.component';
import { ProofHistoryComponent } from './proof-history/proof-history.component';
import { EmployeeService } from '../../../../services/employee/employee.service';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})

export class AttendanceComponent implements OnInit {

  constructor (
    private dialog: MatDialog,
    private ds: DataService,
    private pop: PopupService,
    private es: EmployeeService
  ) { }

  isTimedIn: boolean = true; 
  attendanceProof: any = [];
  attendance = [
    {
      day: 'Monday',
      time_in: null,
      time_out: null,
      uploaded_at: null,
      images: []
    },
    {
      day: 'Tuesday',
      time_in: null,
      time_out: null,
      uploaded_at: null,
      images: []
    },
    {
      day: 'Wednesday',
      time_in: null,
      time_out: null,
      uploaded_at: null,
      images: []
    },
    {
      day: 'Thursday',
      time_in: null,
      time_out: null,
      uploaded_at: null,
      images: []
    },
    {
      day: 'Friday',
      time_in: null,
      time_out: null,
      uploaded_at: null,
      images: []
    },
    {
      day: 'Saturday',
      time_in: null,
      time_out: null,
      uploaded_at: null,
      images: []
    },
  ];

  currentTimeIn = null;
  employee: any;

  ngOnInit(): void {
    this.employee = this.es.getEmployee();

    this.ds.request('GET', 'employee/attendance').subscribe({
      next: (res: any) => {
        res.data.forEach((element: any) => {
          const index = this.attendance.findIndex(dayData => dayData.day === element.day);

          if(index != -1) { this.attendance[index] = element; }
        });

        this.setAttendanceProof();
      },
      error: (err: any) => {
        this.pop.swalBasic('error', this.pop.genericErrorTitle, err.error.message);
      }
    });
  }

  setAttendanceProof() {
    this.attendanceProof = this.attendance.filter(x => x.time_in !== null);
    this.currentTimeIn = this.attendanceProof[this.attendanceProof.length - 1].time_in;
  }

  openHistory() {
    if (this.dialog) {
      this.dialog.open(ProofHistoryComponent, { data: this.attendanceProof });
    } else {
      console.error('Dialog is not initialized');
    }
  }

  openDialog() {
    if (this.dialog) {
      const dialogRef = this.dialog.open(UploadProofComponent);
      
      dialogRef.afterClosed().subscribe((res: any) => {
        if(res) {
          let record = this.attendance.find(element => element.day === res.day);
          if(record) {
            Object.assign(record.images, res.images);
          }
        }
      });

    } else {
      console.error('Dialog is not initialized');
    }
  }

  toggleTime() {
    this.ds.request('POST', 'employee/attendance/clock').subscribe({
      next: (res: any) => {
        this.pop.toastWithTimer('success', res.message);
        this.isTimedIn = !this.isTimedIn;

        let record = this.attendance.find(element => element.day === res.data.day);
        if(record) {
          Object.assign(record, res.data);
        }

        this.setAttendanceProof();
      },
      error: (err: any) => {
        this.pop.swalBasic('error', this.pop.genericErrorTitle, err.error.message);
      }
    });
  }
}





