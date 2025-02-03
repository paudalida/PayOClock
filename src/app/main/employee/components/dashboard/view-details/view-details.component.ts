import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

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
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.popupData = data.popupData || [];
    this.popupTitle = data.popupTitle || 'Details';
    this.isPresentOrLate = data.isPresentOrLate || false;
    this.isLate = data.isLate || false;

    // Dynamically set displayed columns
    this.displayedColumns = ['fullDate', 'status'];
    if (this.isPresentOrLate) {
      this.displayedColumns.push('timeIn', 'timeOut');
    }
  }

  formatFullDate(date: string): string {
    const fullDate = new Date(date);
    if (isNaN(fullDate.getTime())) {
      return 'Invalid Date';
    }
  
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    };
  
    return fullDate.toLocaleDateString('en-US', options);
  }

  closePopup() {
    this.dialogRef.close();
    this.router.navigate(['/employee/dashboard']);
  }
}
