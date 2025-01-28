import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../../../services/data/data.service';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-activitylogs',
  templateUrl: './activitylogs.component.html',
  styleUrl: './activitylogs.component.scss'
})
export class ActivitylogsComponent implements OnInit{
navigate(arg0: string) {
throw new Error('Method not implemented.');
}

  constructor(
    private ds: DataService,
    private paginatorIntl: MatPaginatorIntl,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router
  ) {}

  datasource: any;

  displayedColumns =  ['name', 'action', 'description', 'logged_at'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.ds.request('GET', 'admin/logs').subscribe((res: any) => {
      this.datasource = new MatTableDataSource(res.data);
      this.datasource.paginator = this.paginator;
    })
  }
  redirectToDashboard() {
    this.router.navigate(['/admin']);
  }
}
