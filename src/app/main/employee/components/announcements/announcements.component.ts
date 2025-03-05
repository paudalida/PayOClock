import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DataService } from '../../../../services/data/data.service';
import { ViewAnnouncementComponent } from './view-announcement/view-announcement.component';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.scss']
})
export class AnnouncementsComponent {

  announcements: any;
  isLoading = true;

  constructor(
    private dialog: MatDialog, 
    private router: Router,
    private ds: DataService
  ) { }

  ngOnInit(): void {
    this.ds.request('GET', 'view/announcements').subscribe({
      next: (res: any) => {
        this.announcements = res.data;
        this.isLoading = false; 
      }
    })
  }
  
  redirectToDashboard() {
    this.router.navigate(['/employee/dashboard']);
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
}
