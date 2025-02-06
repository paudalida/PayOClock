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
    present: {
      weekly: 0,
      monthly: 0
    },
    lates: {
      weekly: 0,
      monthly: 0
    },
    absences: {
      weekly: 0,
      monthly: 0
    },
    attendanceWeekly: {
      present: [],
      absences: []
    },
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

  containerVisibility: Record<'present' | 'lates' | 'absences' | 'announcement' | 'announcementHistory', boolean> = {
    present: true,
    lates: true,
    absences: true,
    announcement: true,
    announcementHistory: true
  };

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private ds: DataService,
    private es: EmployeeService
  ) { }

  ngOnInit(): void {   
    this.ds.request('GET', 'employee/dashboard').subscribe({
      next: (res: any) => {
        this.containerData['announcement'] = res.data.announcements[0];
        this.containerData['announcementHistory'] = res.data.announcements[1];
        this.containerData['present']['weekly'] = res.data.attendance.weekly.present;
        this.containerData['present']['monthly'] = res.data.attendance.monthly.present;
        this.containerData['absences']['weekly'] = res.data.attendance.weekly.absences;
        this.containerData['absences']['monthly'] = res.data.attendance.monthly.absences;
        this.containerData['attendanceWeekly'] = res.data.attendanceRecords.weekly;
        this.containerData['attendanceMonthly'] = res.data.attendanceRecords.monthly;
        
        this.containerVisibility = this.es.getConfig();
        this.isLoading = false;  
      }
    });
  }

  toggleContainerVisibility(container: string) {
    this.containerVisibility[container as 'present' | 'lates' | 'absences' | 'announcement' | 'announcementHistory'] = 
      !this.containerVisibility[container as 'present' | 'lates' | 'absences' | 'announcement' | 'announcementHistory'];
  }

  openPopup(type: string): void {
    let popupData: any[] = [];
    let popupTitle = '';
    let status = 'Present';

    if (type === 'present') {
      if(this.selectedFilterOption === 'week') {
        popupData = this.containerData['attendanceWeekly']['present'];
      } else if(this.selectedFilterOption === 'month') {
        popupData = this.containerData['attendanceMonthly']['present'];
      }
    } else if (type === 'absences') {
      status = 'Absent';
      popupTitle = 'Absent Records';
      if(this.selectedFilterOption === 'week') {
        popupData = this.containerData['attendanceWeekly']['absences'];
      } else if(this.selectedFilterOption === 'month') {
        popupData = this.containerData['attendanceMonthly']['absences'];
      }
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
        next: (res: any) => {
          console.log('Toggle action response:', res.message);
        }
      });
    });
  }

  redirectToAnnouncements() {
    this.router.navigate(['/employee/dashboard/announcement']);
  }

  selectFilterOption(event: Event): void {
    event.stopPropagation();  
    const selectElement = event.target as HTMLSelectElement;
    this.selectedFilterOption = selectElement.value;
    console.log('Selected filter option:', this.selectedFilterOption);
  }  

  stopPopupPropagation(event: MouseEvent): void {
    event.stopPropagation();  
  }
  
}
