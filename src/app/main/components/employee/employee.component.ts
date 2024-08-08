import { Component, ElementRef, OnInit, ViewChild, effect, signal } from '@angular/core';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ChangeDetectorRef } from '@angular/core';
import { EmployeeFormComponent } from '../dialogs/employee-form/employee-form.component';
import { DataService } from '../../../services/data/data.service';
import { PopupService } from '../../../services/popup/popup.service';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private paginatorIntl: MatPaginatorIntl,
    private changeDetectorRef: ChangeDetectorRef,
    private ds: DataService,
    private pop: PopupService

  ) {
    this.paginator = new MatPaginator(this.paginatorIntl, this.changeDetectorRef);
  }

  displayedColumns: string[] = ['name', 'employee_id', 'gender', 'position', 'contact'];
  dataSource: any;
  isModalOpen: boolean = false;
  userID: number = 0;

  signal = signal({
    id: null,
    type: null,
    employee_id: null,
    first_name: null,
    middle_name: null,
    last_name: null,
    ext_name: null,
    sex: null,
    position: null,
    phone_number: null
  });

  signalEffect = effect(()=> { 
    if(this.signal().id) { this.showActions(); }
  });

  ngOnInit(): void {
    this.getData();
  }

  protected getData() {
    this.ds.request('GET', 'admin/employees', null).subscribe((res: any) => {      
      this.dataSource = new MatTableDataSource<Employee>(res.data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.sort.sortChange.subscribe(() => {
        this.applySort();
      });
    })
  }

  search(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
  
    const match = (employee: Employee, filter: string) => {
      return (
        employee.first_name.toLowerCase().includes(filter) ||
        employee.middle_name[0].toLowerCase().includes(filter) ||
        employee.last_name.toLowerCase().includes(filter) ||
        employee.ext_name.toLowerCase().includes(filter) ||
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

  /* ACTIONS */
  async showActions() {
    const result = await this.pop.swalWith3Buttons('question', 'Select action', '', 'Edit', 'Archive');
    const id = this.signal().id; // to avoid being set to null by signal.set()

    switch(result) {
      case 'confirmed':
        this.openDialog('');
        break;

      case 'denied':
        const archive = await this.pop.swalWithCancel('warning', 'Archive', 'Are you sure you want to archive this employee?', 'Yes', 'No', false);

        if(archive) {
          this.ds.request('DELETE', 'admin/employees/archive/' + id, null).subscribe({
            next: (res: any) => { 
              this.pop.toastWithTimer('success', 'Employee archived successfully!');
              this.dataSource.data = this.dataSource.data.filter((item: any) => item.id !== id);
            },
            error: (err: any) => { this.pop.swalBasic('error', 'Error', err.error.message); }
          })
        }
        break;
    }

    this.signal.set({
      id: null,
      type: null,
      employee_id: null,
      first_name: null,
      middle_name: null,
      last_name: null,
      ext_name: null,
      sex: null,
      position: null,
      phone_number: null
    });
  }

  openDialog(method: string): void {
    const dialogRef = this.dialog.open(EmployeeFormComponent, {
      width: '250px',
      data: {name: "Charles"}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}

export interface Employee {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  ext_name: string;
  employee_id: string;
  sex: number;
  position: string;
  contact: string;
}