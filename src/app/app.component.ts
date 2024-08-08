import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'GM18';
  constructor(private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.router.navigate(['/main']);
    } else {
      this.router.navigate(['/login']);
    }
  }

}
