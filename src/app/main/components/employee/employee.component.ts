import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AddemployeeComponent } from './addemployee/addemployee.component';

import { MatDialog } from '@angular/material/dialog';

import { MatPaginator, MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatTableModule,
    MatFormFieldModule,
    MatCardModule
  ],
})
export class EmployeeComponent implements OnInit {
  displayedColumns: string[] = ['name', 'id', 'gender', 'position', 'contact'];
  dataSource: any;
  isModalOpen: boolean = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private paginatorIntl: MatPaginatorIntl,
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,

  ) {
    this.paginator = new MatPaginator(this.paginatorIntl, this.changeDetectorRef);
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<PeriodicElement>(this.getData());
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  protected getData() {
    return [
      { name: 'Iverson Culanag', id: '001', gender: 'Male', position: 'Bestie ko ', contact: '09123456789' },
      { name: 'Min Yoongi', id: '002', gender: 'Male', position: 'Bebe ko', contact: '09123456789' }, 
      { name: 'Gian Bernardino', id: '003', gender: 'Male', position: 'Bebe ko na singer', contact: '09123456789' },
      { name: 'Roronoa Zoro', id: '004', gender: 'Male', position: 'Bebe ko sa OP', contact: '09123456789' }, 
      { name: 'Kei Tsukishima', id: '005', gender: 'Male', position: 'Bebe ko sa Haikyu', contact: '09123456789' },
      { name: 'Inosuke Hashibira', id: '006', gender: 'Male', position: 'Crush ko sa DS', contact: '09123456789' }, 
      { name: 'Muichiro Tokito', id: '007', gender: 'Male', position: 'Bebe ko sa DS', contact: '09123456789' },
      { name: 'Obanai Iguro', id: '008', gender: 'Male', position: 'Crush ko sa DS', contact: '09123456789' }, 
    ];
  }

}

export interface PeriodicElement {
  name: string;
  id: string;
  gender: string;
  position: string;
  contact: string;
}