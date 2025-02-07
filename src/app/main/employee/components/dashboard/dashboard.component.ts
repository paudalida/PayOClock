import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../../../../services/data/data.service';
import { ViewDetailsComponent } from './view-details/view-details.component';
import { ToggleActionComponent } from './toggle-action/toggle-action.component';
import { EmployeeService } from '../../../../services/employee/employee.service';

interface ContainerVisibility {
  present: boolean;
  lates: boolean;
  absences: boolean;
  announcement: boolean;
  announcementHistory: boolean;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  isLoading = true;
  selectedFilterOption: string = 'week'; 
  containerData: { [key: string]: any } = {
    present: 0,
    absences: 0,
    attendanceMonthly: {
      present: [],
      absences: []
    },
    announcement: {
      image: '',
      title: '',
      content: '',
      created_at: ''
    },
    announcementHistory: {
      image: '',
      title: '',
      content: '',
      created_at: ''
    }
  };
  attendance: any;

  containerVisibility: Record<'present' | 'absences' | 'announcement' | 'announcementHistory', boolean> = {
    present: true,
    absences: true,
    announcement: true,
    announcementHistory: true
  };
  groupedByMonth: any;
  months: any = [];
  holidays: any = [];
  filterValue = '';

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private ds: DataService,
    private es: EmployeeService
  ) { }

  ngOnInit(): void {   
    this.ds.request('GET', 'employee/dashboard').subscribe({
      next: (res: any) => {        
        this.containerVisibility = this.es.getConfig();
        this.containerData['announcement'] = res.data.announcements[0];
        this.containerData['announcementHistory'] = res.data.announcements[1];
        this.attendance = res.data.records;
        this.holidays = res.data.holidays;
        this.isLoading = false;  
        this.addMissingAbsences()

        this.months = Object.keys(this.groupedByMonth);
        this.filterValue = this.months[0];
        this.selectFilterOption();
      }
    });
  }

  addMissingAbsences(): void {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const currentDay = currentDate.getDate();
    const monthsToCheck = 3; // Number of months to check backwards
    const absenceRecords: any[] = [];
  
    for (let i = 0; i < monthsToCheck; i++) {
      const month = currentMonth - i;
      const year = month < 0 ? currentYear - 1 : currentYear;
      const adjustedMonth = (month + 12) % 12;
      const daysInMonth = new Date(year, adjustedMonth + 1, 0).getDate();
      const daysToCheck = (i === 0) ? currentDay : daysInMonth; // Check only up to the current day for the current month
  
      for (let day = 1; day <= daysToCheck; day++) {
        const date = new Date(year, adjustedMonth, day);
        const dateString = date.toISOString().split('T')[0];
  
        // Extract month and day from the date
        const dateMonthDay = dateString.slice(5); // Format: MM-DD
  
        // Check if the date is a holiday (disregard year)
        const isHoliday = this.holidays.some((holiday: string) => holiday.slice(5) === dateMonthDay);
  
        // Exclude weekends (Saturday and Sunday) and holidays
        if (date.getDay() > 1 && !isHoliday) {
          const hasRecord = this.attendance.some((record: any) => record.date === dateString);
          if (!hasRecord) {
            const absenceRecord = {
              date: dateString,
              status: 'Absent'
            };
            this.containerData['attendanceMonthly']['absences'].push(absenceRecord);
            absenceRecords.push(absenceRecord);
          }
        }
      }
    }
  
    // Update grouped data
    this.groupedByMonth = this.groupByMonth(this.attendance.concat(absenceRecords));
  }
  
  groupByMonth(records: any[]): any {
    const grouped = records.reduce((acc, record) => {
      const month = new Date(record.date).toISOString().slice(0, 7); // Get the year-month part of the date
      if (!acc[month]) {
        acc[month] = { attendance: [], absences: [] };
      }
      if (record.status === 'Absent') {
        acc[month].absences.push(record);
      } else {
        acc[month].attendance.push(record);
      }
      return acc;
    }, {});
  
    return grouped;
  }
  
  toggleContainerVisibility(container: string) {
    this.containerVisibility[container as 'present' | 'absences' | 'announcement' | 'announcementHistory'] = 
      !this.containerVisibility[container as 'present' | 'absences' | 'announcement' | 'announcementHistory'];
  }

  openPopup(type: string): void {
    let popupData: any[] = [];
    let popupTitle = '';
    let status = 'Present';

    if (type === 'present') {
      popupData = this.containerData['attendanceMonthly']['present'];
    } else if (type === 'absences') {
      status = 'Absent';
      popupTitle = 'Absent Records';
      popupData = this.containerData['attendanceMonthly']['absences'];
    }

    this.dialog.open(ViewDetailsComponent, {
      width: '600px',
      data: { popupData: popupData.reverse(), popupTitle, status: status }
    });
  }

  toggleAction(): void {
    const dialogRef = this.dialog.open(ToggleActionComponent, {
      data: { containerVisibility: this.containerVisibility }  
    });
  
    dialogRef.componentInstance.visibilityChanged.subscribe((updatedVisibility) => {
      this.containerVisibility = updatedVisibility;
      this.es.setConfig(this.containerVisibility);

      const config = {
        config: JSON.stringify(updatedVisibility)
      }
      this.ds.request('POST', 'view/dashboard/toggle', config).subscribe({
        next: (res: any) => { }
      });
    });
  }

  redirectToAnnouncements() {
    this.router.navigate(['/employee/dashboard/announcement']);
  }

  selectFilterOption(): void {
    this.containerData['attendanceMonthly']['present'] = this.groupedByMonth[this.filterValue].attendance;
    this.containerData['attendanceMonthly']['absences'] = this.groupedByMonth[this.filterValue].absences;
    this.containerData['present'] = this.containerData['attendanceMonthly']['present'].length;
    this.containerData['absences'] = this.containerData['attendanceMonthly']['absences'].length;
  }  

  stopPopupPropagation(event: MouseEvent): void {
    event.stopPropagation();  
  }
  
}
