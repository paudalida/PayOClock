import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import { DataService } from '../../../../services/data/data.service';
import { PopupService } from '../../../../services/popup/popup.service';
import { AdminService } from '../../../../services/admin/admin.service';

import { EmployeeFormComponent } from '../dialogs/employee-form/employee-form.component';
import { ViewDetailsComponent } from '../employee/view-details/view-details.component';

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
  selector: 'app-archives',
  templateUrl: './archives.component.html',
  styleUrl: './archives.component.scss'
})
export class ArchivesComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private paginatorIntl: MatPaginatorIntl,
    private changeDetectorRef: ChangeDetectorRef,
    private ds: DataService,
    private pop: PopupService,
    private as: AdminService,
    private router: Router,

  ) {
    this.paginator = new MatPaginator(this.paginatorIntl, this.changeDetectorRef);
  }

  displayedColumns: string[] = ['name', 'employee_id', 'gender', 'position', 'action'];
  dataSource: any;

  /* Employee getters */
  get employee() {
    return this.as.getEmployee();
  }

  setEmployee(data: any) {
    this.as.setEmployee(data);
  }

  ngOnInit(): void {
    this.getData();
  }

  ngAfterViewInit(): void {    
    this.setupTableFunctions();
  }

  protected getData() {
    this.dataSource = new MatTableDataSource<Employee>(this.as.getEmployees());
  }

  protected setupTableFunctions() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  search(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
  
    const match = (employee: Employee, filter: string) => {
      return (
        employee.first_name.toLowerCase().includes(filter) ||
        (employee.middle_name && employee.middle_name[0].toLowerCase().includes(filter)) ||
        employee.last_name.toLowerCase().includes(filter) ||
        (employee.ext_name && employee.ext_name.toLowerCase().includes(filter)) ||
        employee.employee_id.toLowerCase().includes(filter)
      );
    };
  
    this.dataSource.filterPredicate = (employee: Employee) => match(employee, searchValue);
    this.dataSource.filter = searchValue;
  }

  sortRecords(a: Employee, b: Employee, active: string, direction: string): number {
    if (direction === '') return 0; 

    const multiplier = direction === 'asc' ? 1 : -1;
    
    switch (active) {
      case 'name':
        return (a.first_name > b.first_name ? 1 : -1) * multiplier;

      case 'employee_id':
        return (a.employee_id > b.employee_id ? 1 : -1) * multiplier;

      case 'position':
        return (a.position > b.position ? 1 : -1) * multiplier;

      default:
        return 0;
    }
  }

  applySort(){
    const active = this.sort.active;
    const direction = this.sort.direction;

    this.dataSource.data = this.dataSource.data.sort((a: any, b: any) => this.sortRecords(a, b, active, direction));
  }


// Method for handling the archive action
async showDeleteAction(employee: any) {
  const result = await this.pop.swalWithCancel('warning', 'Permanent Delete', 
    'Are you sure you want to permanently delete this employee?', 'Yes', 'No', false);

  if (result) {
    // const archive = await this.pop.swalWithCancel('warning', 'Archive', 
    //   'Are you sure you want to archive this employee?', 'Yes', 'No', false);

    // if (archive) {
  //     this.ds.request('DELETE', 'admin/employees/archive/' + employee.id, null).subscribe({
  //       next: () => { 
  //         this.pop.toastWithTimer('success', 'Employee archived successfully!');
  //         this.dataSource.data = this.dataSource.data.filter((item: any) => item.id !== employee.id);
  //       },
  //       error: (err: any) => { 
  //         this.pop.swalBasic('error', 'Error', err.error.message); 
  //       }
  //     });
  //   // }
  // }
  }
}

async showRestoreAction(employee: any) {
  const result = await this.pop.swalWithCancel('question', 'Restore', 
    'Are you sure you want to restore this employee?', 'Yes', 'No', false);

  if (result) {
    // const archive = await this.pop.swalWithCancel('warning', 'Archive', 
    //   'Are you sure you want to archive this employee?', 'Yes', 'No', false);

    // if (archive) {
  //     this.ds.request('DELETE', 'admin/employees/archive/' + employee.id, null).subscribe({
  //       next: () => { 
  //         this.pop.toastWithTimer('success', 'Employee archived successfully!');
  //         this.dataSource.data = this.dataSource.data.filter((item: any) => item.id !== employee.id);
  //       },
  //       error: (err: any) => { 
  //         this.pop.swalBasic('error', 'Error', err.error.message); 
  //       }
  //     });
  //   // }
  // }
  }
}

  viewDetails() {
    if (this.dialog) {
      this.dialog.open(ViewDetailsComponent);
    } else {
      console.error('Dialog is not initialized');
    }
  }

  redirectToAnnouncements() {
    this.router.navigate(['/admin/archives/announcement']);
  }
}