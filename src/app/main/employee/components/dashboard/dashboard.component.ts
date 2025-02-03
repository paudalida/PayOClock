import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../../../../services/data/data.service';
import { ViewDetailsComponent } from './view-details/view-details.component';
import { ToggleActionComponent } from './toggle-action/toggle-action.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  absences = 0;
  lates = 0;
  present = 0;
  announcement = {
    image: '',
    title: '',
    content: '',
    published_at: ''
  };
  recentAnnouncement: any = null;  
  previousAnnouncement: any[] = [];

  attendanceRecords = [
    { month: 'January', day: 1, year: 2025, date: '2025-01-01', timeIn: '9:00 AM', timeOut: '5:00 PM', status: 'Late' },
    { month: 'January', day: 2, year: 2025, date: '2025-01-02', timeIn: '9:15 AM', timeOut: '5:00 PM', status: 'Late' },
    { month: 'January', day: 3, year: 2025, date: '2025-01-03', timeIn: '', timeOut: '', status: 'Absent' },
    { month: 'January', day: 4, year: 2025, date: '2025-01-04', timeIn: '10:00 AM', timeOut: '5:00 PM', status: 'Late' },
    { month: 'January', day: 5, year: 2025, date: '2025-01-05', timeIn: '9:05 AM', timeOut: '5:00 PM', status: 'Late' },
    { month: 'January', day: 6, year: 2025, date: '2025-01-06', timeIn: '8:00 AM', timeOut: '5:00 PM', status: 'Present' },
    { month: 'January', day: 7, year: 2025, date: '2025-01-07', timeIn: '8:55 AM', timeOut: '5:00 PM', status: 'Late' },
    { month: 'January', day: 8, year: 2025, date: '2025-01-08', timeIn: '', timeOut: '', status: 'Absent' },
    { month: 'January', day: 9, year: 2025, date: '2025-01-09', timeIn: '9:20 AM', timeOut: '5:00 PM', status: 'Late' },
    { month: 'January', day: 10, year: 2025, date: '2025-01-10', timeIn: '8:00 AM', timeOut: '5:00 PM', status: 'Present' },
    { month: 'January', day: 10, year: 2025, date: '2025-01-11', timeIn: '8:00 AM', timeOut: '5:00 PM', status: 'Present' },
    { month: 'January', day: 10, year: 2025, date: '2025-01-12', timeIn: '8:00 AM', timeOut: '5:00 PM', status: 'Present' }
  ];

  selectedFilterOption: string = 'week'; 

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private ds: DataService
  ) { }

  ngOnInit(): void {
    this.present = 10;
    this.absences = 5;
    this.lates = 3;

    this.ds.request('GET', 'employee/dashboard').subscribe({
      next: (res: any) => {
        this.announcement.image = res.data.announcement.image;
        this.announcement.title = res.data.announcement.title;
        this.announcement.content = res.data.announcement.content;
        this.announcement.published_at = res.data.announcement.published_at;
      }
    })
  }

  openPopup(type: string): void {
    let popupData: any[] = [];
    let popupTitle = '';

    if (type === 'present') {
      popupTitle = 'Present Records';
      popupData = this.attendanceRecords.filter(record => record.timeIn && record.timeOut);
    } else if (type === 'lates') {
      popupTitle = 'Late Records';
      popupData = this.attendanceRecords.filter(record => record.status === 'Late');
    } else if (type === 'absences') {
      popupTitle = 'Absence Records';
      popupData = this.attendanceRecords.filter(record => !record.timeIn && !record.timeOut);
    }

    this.dialog.open(ViewDetailsComponent, {
      width: '600px',
      data: { popupData, popupTitle }
    });
  }

  toggleAction(): void {
    const dialogRef = this.dialog.open(ToggleActionComponent, {
    });
  }

  redirectToAnnouncements() {
    this.router.navigate(['/employee/dashboard/announcement']);
  }

  selectFilterOption(event: Event): void {
    event.stopPropagation();  // Prevents the click event from propagating further
    const selectElement = event.target as HTMLSelectElement;
    this.selectedFilterOption = selectElement.value;
    console.log('Selected filter option:', this.selectedFilterOption);
  }  

  stopPopupPropagation(event: MouseEvent): void {
    event.stopPropagation();  
  }
}
