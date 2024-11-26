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
export class AnnouncementComponent implements OnInit {

  announcements: any;

  constructor(
    private dialog: MatDialog, 
    private ds: DataService, 
    private pop: PopupService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.ds.request('GET', 'admin/archives/announcements').subscribe({
      next: (res: any) => {
        this.announcements = res.data;

        console.log(this.announcements)
      }
    });
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

  async restoreAnnouncement(event: Event, id: number): Promise<void> {
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
      this.ds.request('POST', 'admin/announcements/restore/' + id).subscribe({
        next: (res: any) => {
          this.pop.toastWithTimer('success', res.message);

          this.announcements = this.announcements.filter((x: any) => x.id != id);
        },
        error: (err: any) => {
          this.pop.swalBasic('error', this.pop.genericErrorTitle, err.error.message);
        }
      });
    }
  }

  async deleteAnnouncement(event: Event, id: number): Promise<void> {
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
      this.ds.request('DELETE', 'admin/announcements/delete/' + id).subscribe({
        next: (res: any) => {
          this.pop.toastWithTimer('success', res.message);

          this.announcements = this.announcements.filter((x: any) => x.id != id);
        },
        error: (err: any) => {
          this.pop.swalBasic('error', this.pop.genericErrorTitle, err.error.message);
        }
      });
    }
  }

}
