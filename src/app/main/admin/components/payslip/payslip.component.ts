import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import { DataService } from '../../../../services/data/data.service';
import { AdminService } from '../../../../services/admin/admin.service';
import { UpdateComponent } from './update/update.component';
import { MatDialog } from '@angular/material/dialog';
import { PopupService } from '../../../../services/popup/popup.service';

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
  selector: 'app-payslip',
  templateUrl: './payslip.component.html',
  styleUrl: './payslip.component.scss'
})
export class PayslipComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'id', 'position', 'status', 'action'];
  dataSource: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  constructor(
    private dialog: MatDialog,
    private as: AdminService,
    private router: Router,
    private ds: DataService,
    private pop: PopupService
  ) { }

  employees: any;
  name: any;
  id: any;
  position: any;
  status: any;
  action: any;
  date = {
    payday_start: '',
    payday_end: ''
  };

  setEmployee(data: any) {
    this.as.setEmployee(data);
  }
  
  ngOnInit(): void {  
    this.date = this.as.getPayday();

    this.dataSource = new MatTableDataSource<Employee>(this.as.getEmployees());

    this.ds.request('GET', 'admin/transactions/latest').subscribe({
      next: (res: any) => {
        this.date = res.data;
        this.as.setPayday(res.data);
      },
      error: (err: any) => {
        this.pop.swalBasic('error', 'Oops! Cannot fetch payroll date', err.error.message);
      }
    })
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

  setupdate() {
    if (this.dialog) {
      const dialogRef = this.dialog.open(UpdateComponent);

      dialogRef.afterClosed().subscribe(result => {
        if(result) this.date = this.as.getPayday();
      });
    } else {
      console.error('Dialog is not initialized');
    }
  }

  redirectToPayroll() {
    this.router.navigate(['/admin/payslips/form']);
  }

  redirectToPayslip() {
    this.router.navigate(['/admin/payslips/payslip']);
  }
}