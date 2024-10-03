import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../services/data/data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit{

  absences = 0;
  lates = 0;
  announcement = {
    image: '',
    title: '',
    content: '',
    published_at: ''
  };

  constructor(
    private router: Router,
    private ds: DataService
  ) { }

  ngOnInit(): void {
    this.ds.request('GET', 'employee/dashboard').subscribe({
      next: (res: any) => {
        this.announcement.image = res.data.announcement.image;
        this.announcement.title = res.data.announcement.title;
        this.announcement.content = res.data.announcement.content;
        this.announcement.published_at = res.data.announcement.published_at;

        this.absences = res.data.attendance.absences;
        this.lates = res.data.attendance.lates;
      }
    })
  }
  redirectToAnnouncements() {
    this.router.navigate(['/employee/dashboard/announcement']);
  }
}
