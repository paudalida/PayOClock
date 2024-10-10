import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { DataService } from '../../../../services/data/data.service';
import { AdminService } from '../../../../services/admin/admin.service';
import { PopupService } from '../../../../services/popup/popup.service';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss']
})
export class PayrollComponent implements OnInit {
  dataSource: any = null;
  fixedColumns: string[] = ['employee_id', 'name', 'position', 'rate'];
  scrollableColumns: any = [];
  payrolls: any = null;
  dateFilter: any = null;
  filterValue = '';
  columns: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private paginatorIntl: MatPaginatorIntl,
    private changeDetectorRef: ChangeDetectorRef, 
    private ds: DataService,
    private as: AdminService,
    private pop: PopupService
  ) {
    this.paginator = new MatPaginator(this.paginatorIntl, this.changeDetectorRef);
  }

  ngOnInit(): void {    
    this.ds.request('GET', 'admin/payrolls').subscribe({
      next: (res: any) => {
        this.columns = res.data.columns;
        this.dateFilter = Object.keys(res.data.columns);
        this.payrolls = res.data.payrolls;
        this.filterValue = this.dateFilter[0];

        this.changeData();
      },
      error: (err: any) => {
        this.pop.swalBasic('error', 'Oops! Cannot fetch payrolls!', this.pop.genericErrorMessage);
      }
    });
  }

  get employees() {
    return this.as.getEmployees();
  }

  changeData() {
    this.scrollableColumns = this.columns[this.filterValue];

    console.log(this.scrollableColumns)
    this.payrolls[this.filterValue].forEach((element: any) => {
      let employee = this.employees.find((emp: any) => emp.id === element.user_id);

      if(employee) {
        element.name = employee.full_name;
        element.position = employee.position;
        element.employee_id = employee.employee_id;
      }
    });

    this.dataSource = new MatTableDataSource<PeriodicElement>(this.payrolls[this.filterValue]);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}

export interface PeriodicElement {
  employee_id: string;
  name: string;
  position: string;
  rate: string;
  allowance: string;
  contributions: string;
  other_deductions: string;
  total_deductions: string;
  net_salary: string;
  total_salary: string;
}