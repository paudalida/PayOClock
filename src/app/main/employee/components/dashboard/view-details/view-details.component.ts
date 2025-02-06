import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

interface Record {
  month: string;
  day: number;
  year: number;
  date: string;
  timeIn?: string;
  timeOut?: string;
  status?: string;
}

@Component({
  selector: 'app-view-details',
  templateUrl: './view-details.component.html',
  styleUrls: ['./view-details.component.scss']
})
export class ViewDetailsComponent {
  
  popupData: Record[];
  popupTitle: string;
  isPresentOrLate: boolean;
  isLate: boolean;
  displayedColumns: string[];

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<ViewDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private datePipe: DatePipe
  ) {
    this.popupData = data.popupData || [];
    this.popupTitle = data.popupTitle || 'Attendance Details';
    this.isPresentOrLate = data.popupTitle === '';
    this.isLate = data.isLate || false;

    // Dynamically set displayed columns
    this.displayedColumns = ['fullDate', 'status'];
    if (this.isPresentOrLate) {
      this.displayedColumns.push('timeIn', 'timeOut');
    }
  }

  convertTime(time: string): string {
    if(time == '') return '-';
    // Assuming the time is in the format 'HH:mm:ss'
    const formattedTime = this.datePipe.transform(`1970-01-01T${time}`, 'h:mm a');
    return formattedTime || time;  // Return formatted time or original if formatting fails
  }

  closePopup() {
    this.dialogRef.close();
    this.router.navigate(['/employee/dashboard']);
  }
}
