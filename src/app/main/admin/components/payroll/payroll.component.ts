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
export class PayrollComponent implements OnInit {
  displayedColumns: string[] = ['name', 'id', 'position', 'status', 'action'];
  dataSource = new MatTableDataSource<Employee>();

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
    this.dataSource.data = this.as.getEmployees();
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