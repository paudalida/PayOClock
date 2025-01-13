import { Component, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { AnnouncementFormComponent as Dialog } from '../dialogs/announcement-form/announcement-form.component';

import { PopupService } from '../../../../services/popup/popup.service';
import { DataService } from '../../../../services/data/data.service';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.scss'
})
export class AnnouncementsComponent implements OnInit{

  constructor (
    private dialog: MatDialog,
    private ds: DataService,
    private pop: PopupService
  ) { }

  isLoading = true;
  paginatorIndex = 1;
  paginatorCount = 5;
  posts: any = [{
    image: '',
    title: '',
    content: ''
  }];

  ngOnInit() {
    this.ds.request('GET', 'view/announcements').subscribe({
      next: (res: any) => { this.posts = res.data; },
      error: () => { 
        this.pop.swalBasic(
        'error', 
        'Error fetching announcements', 
        'We are working on it. You can help us speed up the process by sending us an error report.');
      },
      complete: () => this.isLoading = false
    })
  }

  openDialog(announcement?: any, type: string = 'add') {
    const data = {
      title: type == 'add' ? 'Add Announcement' : 'Edit Announcement',
      button: type.toUpperCase(),
      details: announcement
    }
    if (this.dialog) {
      const dialogRef = this.dialog.open(Dialog, { data });

      dialogRef.afterClosed().subscribe((res: any) => {

        if(res) {
          if (res.method == 'POST') { this.posts.unshift(res.data); }
          else if (res.method == 'PUT') {
            this.posts = this.posts.map((post: any) =>
              post.id === res.data.id ? res.data : post
            );
          }
        }
      });
    }
  }

  async archive(id: number) {
    const archive = await this.pop.swalWithCancel('warning', 'Archive', 'Are you sure you want to archive this announcement?', 'Yes', 'No', false);

    if(archive) {
      this.ds.request('DELETE', 'admin/announcements/archive/' + id, null).subscribe({
        next: (res: any) => { 
          this.pop.toastWithTimer('success', res.message);
          this.posts = this.posts.filter((item: any) => item.id !== id);
        },
        error: (err: any) => { this.pop.swalBasic('error', 'Error', err.error.message); }
      });
    }
  }

  /* Paginator functions */
  changePaginator(event: Event) {
    const count = (event.target as HTMLSelectElement).value;
    this.paginatorCount = Number(count);
    this.paginatorIndex = 1;
  }

  first() {
    this.paginatorIndex = 1;
  }

  next() {
    if((this.paginatorIndex + this.paginatorCount) < this.posts.length)
      this.paginatorIndex += this.paginatorCount;
  }

  previous() {
    if((this.paginatorIndex - this.paginatorCount) >= 1 )
      this.paginatorIndex -= this.paginatorCount;
  }

  last() {
    const length = this.posts.length;
    const excess = (length % this.paginatorCount) == 0 ? (this.paginatorCount) : (length % this.paginatorCount);
    this.paginatorIndex = length - excess+1;
  }
}


