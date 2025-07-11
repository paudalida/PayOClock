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
      this.displayedColumns.push('timeIn', 'timeOut', 'renderedHours');
    }
  }

    calculateRenderedHours(timeIn: string, timeOut: string): string {
    if (!timeIn || !timeOut) return '-';

    const parseTime = (timeStr: string): Date | null => {
      const [time, modifier] = timeStr.toLowerCase().split(' ');
      const [hoursStr, minutesStr] = time.split(':');
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);

      if (modifier === 'pm' && hours !== 12) hours += 12;
      if (modifier === 'am' && hours === 12) hours = 0;

      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    };

    const start = parseTime(timeIn);
    const end = parseTime(timeOut);

    if (!start || !end || end < start) return '-';

    let totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    // Subtract 1 hour for lunch if > 8 hours
    if (totalMinutes > 480) {
      totalMinutes -= 60;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    return `${hours}h ${minutes}m`;
  }

  calculateRenderedMinutes(timeIn: string, timeOut: string): number {
    if (!timeIn || !timeOut) return 0;

    const parseTime = (timeStr: string): Date | null => {
      const [time, modifier] = timeStr.toLowerCase().split(' ');
      const [hoursStr, minutesStr] = time.split(':');
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);

      if (modifier === 'pm' && hours !== 12) hours += 12;
      if (modifier === 'am' && hours === 12) hours = 0;

      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    };

    const start = parseTime(timeIn);
    const end = parseTime(timeOut);

    if (!start || !end || end < start) return 0;

    let totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    if (totalMinutes > 480) {
      totalMinutes -= 60;
    }

    return totalMinutes;
  }

  calculateTotalRendered(): string {
    let totalMinutes = 0;

    this.popupData.forEach((record: any) => {
      totalMinutes += this.calculateRenderedMinutes(record.time_in, record.time_out);
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    return `${hours}h ${minutes}m`;
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
