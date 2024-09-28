import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DataService } from '../../../../../services/data/data.service';
import { ViewAnnouncementComponent } from '../view-announcement/view-announcement.component';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.scss']
})
export class AnnouncementsComponent {

  announcementImage: string = '/assets/images/no image.png';
  announcementTitle: string = 'Title';
  announcementDescription: string = `
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
  Vestibulum eget vehicula sapien. Cras sit amet augue magna. 
  Proin suscipit diam nec justo suscipit, in viverra lacus fringilla. 
  Quisque vitae felis vel arcu viverra fermentum sit amet et justo. 
  Nulla facilisi. Mauris vitae magna eu odio sollicitudin commodo. 
  Vestibulum tempus sem nec tellus congue, in tempus tortor feugiat. 
  Cras facilisis metus ac orci gravida, in aliquam massa cursus. 
  Duis at risus at eros vehicula sagittis vel at purus. Etiam vel lorem in purus iaculis bibendum. 
  Integer at orci et felis sodales ultrices. Sed vitae dolor odio. 
  Proin dictum eros non tortor placerat, in interdum nulla sagittis. 
  Suspendisse potenti. Morbi dapibus risus id sapien consequat, non consequat velit lacinia. 
  `;
  publishDate: Date = new Date(); 
  publishTime: Date = new Date();

  previousAnnouncements: Array<any> = [
    { id: 1, 
      title: 'Lorem ipsum', 
      shortDescription: 'Lorem ipsum dolor sit amet...', 
      image: '/assets/images/no image.png', date: new Date() 
    },
    { id: 2, 
      title: 'Lorem ipsum', 
      shortDescription: 'Lorem ipsum dolor sit amet...', 
      image: '/assets/images/no image.png', date: new Date() 
    },
    { id: 3, 
      title: 'Lorem ipsum', 
      shortDescription: 'Lorem ipsum dolor sit amet...', 
      image: '/assets/images/no image.png', date: new Date() 
    },
    { id: 4, 
      title: 'Lorem ipsum', 
      shortDescription: 'Lorem ipsum dolor sit amet...', 
      image: '/assets/images/no image.png', date: new Date() 
    },
  ];

  announcements: any;

  constructor(
    private dialog: MatDialog, 
    private router: Router,
    private ds: DataService
  ) { }

  ngOnInit(): void {
    this.ds.request('GET', 'view/announcements').subscribe({
      next: (res: any) => {
        this.announcements = res.data;
      }
    })
  }
  
  redirectToDashboard() {
    this.router.navigate(['/employee/dashboards']);
  }

  viewAnnouncement(announcement: any): void {
    this.dialog.open(ViewAnnouncementComponent, {
      data: {
        title: announcement.title,
        description: announcement.shortDescription, 
        image: announcement.image,
        created_at: announcement.date
      }
    });
  }
}
