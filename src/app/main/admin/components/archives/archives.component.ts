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
export class ArchivesComponent implements OnInit {

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

  displayedColumns: string[] = ['employee_id', 'name', 'gender', 'position', 'action'];
  dataSource: any;

  setEmployee(data: any) {
    this.as.setEmployee(data);
  }

  ngOnInit(): void {
    this.ds.request('GET', 'admin/archives/employees').subscribe((res: any) => {
      this.dataSource = new MatTableDataSource(res.data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    )
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
// async showDeleteAction(id: string) {
//   const result = await this.pop.swalWithCancel('warning', 'Permanent Delete', 
//     'Are you sure you want to permanently delete this employee?', 'Yes', 'No', false);

//   if (result) {
//     // const archive = await this.pop.swalWithCancel('warning', 'Archive', 
//     //   'Are you sure you want to archive this employee?', 'Yes', 'No', false);

//     this.ds.request('DELETE', 'admin/employees/delete/' + id).subscribe({
//       next: (res: any) => {
//         this.pop.toastWithTimer('success', res.message);
//       },
//       error: (err: any) => {
//         this.pop.swalBasic('error', this.pop.genericErrorTitle, err.error.message);
//       }
//     });
//   }
// }

async showRestoreAction(id: string) {
  const result = await this.pop.swalWithCancel('question', 'Restore', 
    'Are you sure you want to restore this employee?', 'Yes', 'No', false);

  if (result) {
    this.ds.request('POST', 'admin/employees/restore/' + id).subscribe({
      next: (res: any) => {
        this.pop.toastWithTimer('success', res.message);

        /* remove data */
        let data = this.dataSource.data;
        this.dataSource.data = data.filter((x: any) => x.id != res.data.id);
        
        /* add to admin service */
        let employees = this.as.getEmployees();
        employees.push(res.data);

        console.log(employees)

        // this.as.setEmployees(employees);
      },
      error: (err: any) => {
        this.pop.swalBasic('error', this.pop.genericErrorTitle, err.error.message);
      }
    });
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