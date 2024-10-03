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
    console.log(data)
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

      this.submit(data);
    }
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
    let data = {
      leave_type: this.selectedLeaveType,
      date: this.data.selectedDate
    };

    this.submit(data)
  }

  submit(data: any) {
    this.ds.request('POST', 'admin/attendance/manual/user/' + this.data.details.user_id, data).subscribe({
      next: (res: any) => {
        this.closePopup(res.data)
        this.pop.toastWithTimer('success', res.message);
      },
      error: (err: any) => {
        this.pop.swalBasic('error', 'Oops! An error has occured', err.error.message);
      }
    });
  }

  closePopup(data?: any) {
    this.dialogRef.close(data);
    this.router.navigate(['/admin/attendance']);
  }
}
