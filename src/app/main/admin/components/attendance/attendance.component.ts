import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../../services/data/data.service';
import { AdminService } from '../../../../services/admin/admin.service';
import { ɵNgNoValidate } from '@angular/forms';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss'
})
export class AttendanceComponent implements OnInit{

  constructor(
    private ds: DataService,
    private as: AdminService
  ) { }

  paginatorIndex = 0;
  paginatorCount = 5;

  get employees() {
    return this.as.getEmployees();
  }

  ngOnInit(): void {
  }

  /* Paginator functions */
  changePaginator(event: Event) {
    const count = (event.target as HTMLSelectElement).value;
    this.paginatorCount = Number(count);
    this.paginatorIndex = 0;
  }

  first() {
    this.paginatorIndex = 0;
  }

  next() {
    if((this.paginatorIndex + this.paginatorCount) < this.employees.length)
      this.paginatorIndex += this.paginatorCount;
  }

  previous() {
    if((this.paginatorIndex - this.paginatorCount) >= 0 )
      this.paginatorIndex -= this.paginatorCount;
  }

  last() {
    this.paginatorIndex = this.employees.length - (this.employees.length % this.paginatorCount) - (this.paginatorCount);
  }
}
