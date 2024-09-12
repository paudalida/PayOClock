import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import { DataService } from '../../../../services/data/data.service';
import { AdminService } from '../../../../services/admin/admin.service';

export interface Employee {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  ext_name: string;
  employee_id: string;
  gender: number;
  position: string;
  action: string;
}

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss']
})
export class PayrollComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'id', 'position', 'status', 'action'];
  dataSource: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  constructor(
    private as: AdminService,
    private router: Router
  ) { }

  employees: any;
  name: any;
  id: any;
  position: any;
  status: any;
  action: any;
  ds: any;

  setEmployee(data: any) {
    this.as.setEmployee(data);
  }
  
  ngOnInit(): void {    
    this.dataSource = new MatTableDataSource<Employee>(this.as.getEmployees());
  }

  ngAfterViewInit(): void {    
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  laterThanNow(date: string) {
    if(!date) return false;
    const inputDate = new Date(date);
        
    // Get the current date and zero out the time (for comparison)
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to midnight for accuracy

    // Compare the input date with the current date
    return inputDate > currentDate;
  }

  redirectToPayroll() {
    this.router.navigate(['/admin/payrolls/form']);
  }

  redirectToPayslip() {
    this.router.navigate(['/admin/payrolls/payslip']);
  }
}