import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import { DataService } from '../../../../services/data/data.service';
import { AdminService } from '../../../../services/admin/admin.service';

export interface PeriodicElement {
  name: string;
  id: string;
  position: string;
  status: string;
  action: string;
}

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss']
})
export class PayrollComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'id', 'position', 'status', 'action'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  employeeRecord: any;

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

  set employee(data: any) {
    this.as.setEmployee(data);
  }
  
  ngOnInit(): void {
    this.employees = this.as.getEmployees();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  redirectToPayroll() {
    this.router.navigate(['/admin/payrolls/form']);
  }

  redirectToPayslip() {
    this.router.navigate(['/admin/payrolls/payslip']);
  }
}

// Sample data
const ELEMENT_DATA: PeriodicElement[] = [
  { name: 'John Doe', id: 'E001', position: 'Manager', status: 'done', action: ' ' },
  { name: 'Jane Smith', id: 'E002', position: 'Developer', status: 'done',  action: ' ' },
  { name: 'Jane Smith', id: 'E003', position: 'Driver', status: 'not yet done',  action: ' ' },
  { name: 'Jane Smith', id: 'E004', position: 'Manager', status: 'done',  action: ' ' },
  { name: 'Jane Smith', id: 'E005', position: 'Admin', status: 'not yet done',  action: ' ' },
  { name: 'Jane Smith', id: 'E006', position: 'Employee', status: 'done',  action: ' ' },
  { name: 'Jane Smith', id: 'E007', position: 'Driver', status: 'not yet done',  action: ' ' },
  { name: 'Jane Smith', id: 'E008', position: 'Developer', status: 'not yet done',  action: ' ' },
];
