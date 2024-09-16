import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DataService } from '../../../../../services/data/data.service';
import { PopupService } from '../../../../../services/popup/popup.service';

@Component({
  selector: 'app-attendance-detail-popup',
  templateUrl: './attendance-detail-popup.component.html',
  styleUrls: ['./attendance-detail-popup.component.scss']
})
export class AttendanceDetailPopupComponent {
  timeIn: Date | null = null;
  timeOut: Date | null = null;
  selectedDay: string;
  dropdownOpen = false;
  selectedAction: 'manual' | 'button' | 'leave' | null = null;
  manualHour: number | null = 1; 
  manualMinute: number | null = 0; 
  manualAmPm: 'AM' | 'PM' = 'AM';
  manualOutHour: number | null = 1; 
  manualOutMinute: number | null = 0; 
  manualOutAmPm: 'AM' | 'PM' = 'AM';
  timeInActive = false;
  timeInEntered = false;
  selectedLeaveType: string = 'Paid Leave';
  
  hours: number[] = Array.from({ length: 12 }, (_, i) => i + 1);
  minutes: number[] = Array.from({ length: 59 }, (_, i) => i + 1);

  constructor(
    public dialogRef: MatDialogRef<AttendanceDetailPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private ds: DataService,
    private pop: PopupService
  ) {
    this.selectedDay = data.day;
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectAction(action: 'manual' | 'button' | 'leave'): void {
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
      this.timeOut = new Date(timeInCopy.setHours(this.manualOutHour!, this.manualOutMinute!, 0, 0));
    }
  }

  updateManualTime(): void {
    if (this.manualHour !== null && this.manualMinute !== null) {
      const hours = this.manualHour;
      const minutes = this.manualMinute;
      const period = this.manualAmPm;

      let hours24 = hours!;
      if (period === 'PM' && hours24 < 12) {
        hours24 += 12;
      } else if (period === 'AM' && hours24 === 12) {
        hours24 = 0;
      }

      const now = new Date();
      now.setHours(hours24, minutes, 0, 0);
      this.timeIn = now;
      this.timeInActive = true;
    }
  }

  updateManualOutTime(): void {
    if (this.manualOutHour !== null && this.manualOutMinute !== null) {
      const hours = this.manualOutHour;
      const minutes = this.manualOutMinute;
      const period = this.manualOutAmPm;

      let hours24 = hours!;
      if (period === 'PM' && hours24 < 12) {
        hours24 += 12;
      } else if (period === 'AM' && hours24 === 12) {
        hours24 = 0;
      }

      const now = new Date();
      now.setHours(hours24, minutes, 0, 0);
      this.timeOut = now;
    }
  }

  toggleTimeInOut(): void {
    if (this.selectedAction === 'button') {
      console.log(this.data.details)
      if (this.timeInActive) {
        
        this.ds.request('POST', 'admin/attendance/time-in/user/' + this.data.details.user_id).subscribe({
          next: (res: any) => {
            this.pop.toastWithTimer('success', res.message);
            this.data.time_in = res.data.time_in;
            this.timeInActive = false;
          },
          error: (err: any) => {
            this.pop.swalBasic('error', 'Oops! An error has occured', err.error.message);
          }
        });
        // this.dialogRef.close({ timeIn: true });
      } else {
        this.ds.request('POST', 'admin/attendance/time-in/user/' + this.data.details.user_id).subscribe({
          next: (res: any) => {
            this.pop.toastWithTimer('success', res.message);
            this.timeInActive = false;
          },
          error: (err: any) => {
            this.pop.swalBasic('error', 'Oops! An error has occured', err.error.message);
          }
        })
        // this.dialogRef.close({ timeOut: true });
      }
    }
  }

  applyLeave(): void {
    console.log('Selected Leave Type:', this.selectedLeaveType);
    this.dialogRef.close({ paidLeave: true });
  }

  closePopup() {
    this.dialogRef.close();
    this.router.navigate(['/admin/attendance']);
  }
}
