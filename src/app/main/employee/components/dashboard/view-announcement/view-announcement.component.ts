import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-announcement',
  templateUrl: './view-announcement.component.html',
  styleUrls: ['./view-announcement.component.scss']
})
export class ViewAnnouncementComponent implements OnInit {

  title: string = '';
  content: string = '';
  image: string = '';
  createdAt: Date = new Date();

  constructor(
    private dialogRef: MatDialogRef<ViewAnnouncementComponent>, 
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.title = this.data.title;
      this.content = this.data.description;
      this.image = this.data.image;
      this.createdAt = this.data.created_at;
    }
  }

  closePopup() {
    this.dialogRef.close();
    this.router.navigate(['/employee/announcements']);
  }

}
