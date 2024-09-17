import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrl: './payroll.component.scss'
})
export class PayrollComponent implements OnInit {
  displayedColumns: string[] = ['employee_id', 'name', 'position', 'net_salary', 'total_deduction', 'total_salary'];
  dataSource : any;
  dialogRef: MatDialog;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatPaginator) paginatior !: MatPaginator;
  @ViewChild(MatSort) sort !: MatSort;
  employee_id: any;
  name: any;
  position: any;
  net_salary: any;
  total_deduction: any;
  total_salary: any;
  ds: any;


  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<PeriodicElement>(this.getData());
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private paginatorIntl: MatPaginatorIntl,
    private elementRef: ElementRef, 
    private changeDetectorRef: ChangeDetectorRef, 
  ) {
  this.dialogRef = dialog;
  this.paginator = new MatPaginator(this.paginatorIntl, this.changeDetectorRef);
  }

  protected getData() {
    this.ds.get('books').subscribe({
      next: (res: any) => {
        return res;
      }
    })
    return [];
  }


}

export interface PeriodicElement {
  employee_id: string;
  name: string;
  position: string;
  net_salary: string;
  total_deduction: string;
  total_salary: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { employee_id: '1222', name: 'Eiichiro Oda', position: 'manager', net_salary: '1200', total_deduction: '3500', total_salary: '5230'}, 
  ];

