import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DataService } from '../../../../../services/data/data.service';
import { PopupService } from '../../../../../services/popup/popup.service';
import { AdminService } from '../../../../../services/admin/admin.service';

@Component({
  selector: 'app-attendance-detail-popup',
  templateUrl: './attendance-detail-popup.component.html',
  styleUrls: ['./attendance-detail-popup.component.scss']
})
export class AttendanceDetailPopupComponent {
  timeIn: Date | null = null;
  timeOut: Date | null = null;
  selectedDay: string;
  selectedDate = '';
  dropdownOpen = false;
  selectedAction: 'manual' | 'leave' | null = 'manual';
  manual = {
    timeIn: null,
    timeOut: null
  };
  timeInActive = false;
  timeInEntered = false;
  selectedLeaveType: string = 'Paid Leave';
  
  hours: number[] = Array.from({ length: 12 }, (_, i) => i + 1);
  minutes: number[] = Array.from({ length: 60 }, (_, i) => i);


  constructor(
    public dialogRef: MatDialogRef<AttendanceDetailPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private ds: DataService,
    private as: AdminService,
    private pop: PopupService
  ) {
    this.selectedDay = data.day;
  }

  get employee() {
    return this.as.getEmployee();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectAction(action: 'manual' | 'leave'): void {
    this.selectedAction = action;
    this.dropdownOpen = false;
    this.timeInActive = false; 
    this.timeInEntered = false; 
  }

  applyManualTime(): void {
    this.updateManualTime();
    this.timeInEntered = true; 
  }

  applyManualOutTime(): void {
    this.updateManualOutTime();
    if (this.timeIn) {
      const timeInCopy = new Date(this.timeIn); 
      // this.timeOut = new Date(timeInCopy.setHours(this.manualOutHour!, this.manualOutMinute!, 0, 0));
    }
  }

  formatTime(time: string) {
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

  updateManualTime(): void {
    if(this.manual.timeIn) {
      const data = {
        time_in: this.manual.timeIn,
        time_out: this.manual.timeOut,
        date: this.data.selectedDate
      };

      this.ds.request('POST', 'admin/attendance/manual/user/' + this.employee.id, data).subscribe({
        next: (res: any) => {
          this.data.details.time_in  = res.data.time_in;
          this.data.details.time_out = res.data.time_out;
          this.data.details.status   = res.data.status;
          this.data.details.date     = res.data.date;
          this.pop.toastWithTimer('success', res.message);
        },
        error: (err: any) => {
          this.pop.swalBasic('error', 'Oops! An error has occured', err.error.message);
        }
      });
    }
  }

  updateManualOutTime(): void {
    // if (this.manualOutHour !== null && this.manualOutMinute !== null) {
    //   const hours = this.manualOutHour;
    //   const minutes = this.manualOutMinute;
    //   const period = this.manualOutAmPm;

    //   let hours24 = hours!;
    //   if (period === 'PM' && hours24 < 12) {
    //     hours24 += 12;
    //   } else if (period === 'AM' && hours24 === 12) {
    //     hours24 = 0;
    //   }

    //   const now = new Date();
    //   now.setHours(hours24, minutes, 0, 0);
    //   this.timeOut = now;
    // }
  }

  get forTimeIn() {
    if(!this.data.details.time_in || this.data.details.time_out) return true;
    else return false;
  }

  // toggleTimeInOut(): void {
  //   if (this.selectedAction === 'button') {
        
  //       this.ds.request('POST', 'admin/attendance/clock/user/' + this.employee.id).subscribe({
  //         next: (res: any) => {
  //           this.pop.toastWithTimer('success', res.message);
  //         },
  //         error: (err: any) => {
  //           this.pop.swalBasic('error', 'Oops! An error has occured', err.error.message);
  //         }
  //       });
  //       // this.dialogRef.close({ timeIn: true });
  //     // } else {
  //     //   this.ds.request('POST', 'admin/attendance/time-out/user/' + this.employee.id).subscribe({
  //     //     next: (res: any) => {
  //     //       this.pop.toastWithTimer('success', res.message);
  //     //       this.timeInActive = false;
  //     //     },
  //     //     error: (err: any) => {
  //     //       this.pop.swalBasic('error', 'Oops! An error has occured', err.error.message);
  //     //     }
  //     //   })
  //     //   // this.dialogRef.close({ timeOut: true });
  //     // }
  //   }
  // }

  applyLeave(): void {
    console.log('Selected Leave Type:', this.selectedLeaveType);
    this.dialogRef.close({ paidLeave: true });
  }

  closePopup() {
    this.dialogRef.close(this.data);
    this.router.navigate(['/admin/attendance']);
  }
}
