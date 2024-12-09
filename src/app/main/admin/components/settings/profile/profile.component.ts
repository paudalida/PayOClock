import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import { DataService } from '../../../../../services/data/data.service';
import { PopupService } from '../../../../../services/popup/popup.service';
import { AdminService } from '../../../../../services/admin/admin.service';

import { EmployeeService } from '../../../../../services/employee/employee.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangePassComponent } from './change-pass/change-pass.component';
import { ChangePassEmployeeComponent } from './change-pass-employee/change-pass-employee.component';

export interface Employee {
  employee_id: string;
  full_name: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, AfterViewInit{

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource: any;
  employee: any;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private paginatorIntl: MatPaginatorIntl,
    private changeDetectorRef: ChangeDetectorRef,
    private es: EmployeeService,
    private fb: FormBuilder,
    private pop: PopupService,
    private ds: DataService,
    private as: AdminService
  ) {
    this.paginator = new MatPaginator(this.paginatorIntl, this.changeDetectorRef);
  }

  displayedColumns: string[] = ['name', 'employee_id'];
  
  contact: FormGroup = this.fb.group({
    phone_number: ['', [ Validators.required ]],
    email:        ['', [ Validators.required ]],
    province:     ['', [ Validators.required, Validators.maxLength(40) ] ],
    city:         ['', [ Validators.required, Validators.maxLength(40) ]],
    barangay:     ['', [ Validators.required, Validators.maxLength(40) ] ],
    street:       ['', [ Validators.required, Validators.maxLength(40) ]],
    house_number: ['', [ Validators.required, Validators.maxLength(40) ]],
    zip_code:     ['', [ Validators.required, Validators.maxLength(10) ] ]
  });

  ngOnInit(): void {
    this.employee = this.es.getEmployee();
    this.getData();

    if(this.employee.contact) {
      let ctemp = this.employee.contact;
      this.contact.setValue({
        phone_number: ctemp.phone_number,
        email:        ctemp.email,
        province:     ctemp.province,
        city:         ctemp.city,
        barangay:     ctemp.barangay,
        street:       ctemp.street,
        house_number: ctemp.house_number,
        zip_code:     ctemp.zip_code
      });
    }
  }

  ngAfterViewInit(): void {    
    this.setupTableFunctions();
  }

  setEmployee(data: any) {
    this.as.setEmployee(data);
  }

  protected getData() {
    let employees = this.as.getEmployees().filter((x: any) => x.employee_id != this.es.getEmployee().employee_id);

    this.dataSource = new MatTableDataSource<Employee>(employees);
  }

  protected setupTableFunctions() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  changePass() {
    if (this.dialog) {
      this.dialog.open(ChangePassComponent);
    } else {
      console.error('Dialog is not initialized');
    }
  }

  changePassEmployee() {
    if (this.dialog) {
      this.dialog.open(ChangePassEmployeeComponent);
    } else {
      console.error('Dialog is not initialized');
    }
  }

  redirectToSettings() {
    this.router.navigate(['/admin/settings']);
  }
}
