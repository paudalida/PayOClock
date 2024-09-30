import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../services/data/data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit{

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
  announcements: any;

  constructor(
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
  redirectToAnnouncements() {
    this.router.navigate(['/employee/dashboard/announcement']);
  }
}
