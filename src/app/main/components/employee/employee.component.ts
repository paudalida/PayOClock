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
import { filter } from 'rxjs';  
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
  displayedColumns: string[] = ['name','id', 'gender', 'position', 'contact'];
  dataSource : any;
  isModalOpen: boolean = false;
  dialogRef: MatDialog;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatPaginator) paginatior !: MatPaginator;
  @ViewChild(MatSort) sort !: MatSort;
  name: any;
  id: any;
  gender: any;
  position: any;
  contact: string | undefined;
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

  
  // applyFilter(event: Event, type: string) {

  //   const select = (document.getElementById('filter') as HTMLSelectElement).value;
  //   const search = (document.getElementById('search') as HTMLInputElement).value;

  //   console.log(select, search)
  //     const titleFilterPredicate = (data: EmployeeComponent, search: string): boolean => {
  //       return data.name.toLowerCase().includes(search.toLowerCase());
  //     }

  //     const authorFilterPredicate = (data: EmployeeComponent, search: string): boolean => {
  //       return data.id.some((x: any) => {
  //         return x.toLowerCase().trim().includes(search.toLowerCase().trim());
  //       });
  //     }

  //     const copyrightFilterPredicate = (data: EmployeeComponent, select: string): boolean => {
  //       return data.gender === select || select === '';
  //     }


  //     const filterPredicate = (data: EmployeeComponent): boolean => {
  //       return (titleFilterPredicate(data, search) ||
  //              authorFilterPredicate(data, search)) &&
  //              copyrightFilterPredicate(data, select);
  //     };
      
  //     this.dataSource.filterPredicate = filterPredicate;
  //     this.dataSource.filter = {
  //       search
  //     };    
  // }
  
  addemployeeBtnClick() {
    if(this.isModalOpen) {
      return
    }
    
    this.isModalOpen = true

    let modal = this.dialogRef.open(AddemployeeComponent, {});
    modal.afterClosed().subscribe(
      (      result: { success: any; }) => {
        this.isModalOpen = false

      }
    )
  }

}

export interface PeriodicElement {
  name: string; 
  id: string; 
  gender: string; 
  position: string; 
  contact: string; 
}

// const ELEMENT_DATA: PeriodicElement[] = [
//   {name: 'One Piece', id: 'Eiichiro Oda', gender: '1999', position: 'manager', contact: '09123456789'}, 
//   ];



