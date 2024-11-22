import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopupService } from '../../../../../services/popup/popup.service';

import { DataService } from '../../../../../services/data/data.service';
import { MatDialog } from '@angular/material/dialog';
import { ViewAnnouncementComponent } from '../../../../employee/components/dashboard/view-announcement/view-announcement.component';

@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html',
  styleUrl: './announcement.component.scss'
})
export class AnnouncementComponent {

  announcements: any;

  constructor(
    private dialog: MatDialog, 
    private ds: DataService, 
    private pop: PopupService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.ds.request('GET', 'view/announcements').subscribe({
      next: (res: any) => {
        this.announcements = res.data;
      }
    })
  }

  viewAnnouncement(announcement: any): void {
    this.dialog.open(ViewAnnouncementComponent, {
      data: {
        title: announcement.title,
        description: announcement.content, 
        image: announcement.image,
        created_at: announcement.created_at
      }
    });
  }

  redirectToEmployees() {
    this.router.navigate(['/admin/archives']);
  }

  async restoreAnnouncement(announcement: any, event: Event): Promise<void> {
    event.stopPropagation(); 
    const result = await this.pop.swalWithCancel(
      'question', 
      'Restore', 
      'Are you sure you want to restore this announcement?', 
      'Yes', 
      'No', 
      false
    );

    if (result) {
      // const archive = await this.pop.swalWithCancel('warning', 'Archive', 
      //   'Are you sure you want to archive this employee?', 'Yes', 'No', false);
  
      // if (archive) {
    //     this.ds.request('DELETE', 'admin/employees/archive/' + employee.id, null).subscribe({
    //       next: () => { 
    //         this.pop.toastWithTimer('success', 'Employee archived successfully!');
    //         this.dataSource.data = this.dataSource.data.filter((item: any) => item.id !== employee.id);
    //       },
    //       error: (err: any) => { 
    //         this.pop.swalBasic('error', 'Error', err.error.message); 
    //       }
    //     });
    //   // }
    // }
    }
  }

  async deleteAnnouncement(announcement: any, event: Event): Promise<void> {
    event.stopPropagation(); // Prevents the parent div click event
    const result = await this.pop.swalWithCancel(
      'warning', 
      'Permanent Delete', 
      'Are you sure you want to permanently delete this announcement?', 
      'Yes', 
      'No', 
      false
    );

    if (result) {
      // const archive = await this.pop.swalWithCancel('warning', 'Archive', 
      //   'Are you sure you want to archive this employee?', 'Yes', 'No', false);
  
      // if (archive) {
    //     this.ds.request('DELETE', 'admin/employees/archive/' + employee.id, null).subscribe({
    //       next: () => { 
    //         this.pop.toastWithTimer('success', 'Employee archived successfully!');
    //         this.dataSource.data = this.dataSource.data.filter((item: any) => item.id !== employee.id);
    //       },
    //       error: (err: any) => { 
    //         this.pop.swalBasic('error', 'Error', err.error.message); 
    //       }
    //     });
    //   // }
    // }
    }
  }

}
