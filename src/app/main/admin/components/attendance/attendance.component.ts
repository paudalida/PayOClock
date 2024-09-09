import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { DataService } from '../../../../services/data/data.service';
import { PopupService } from '../../../../services/popup/popup.service';
import { ViewProofComponent } from './view-proof/view-proof.component';


export interface AttendanceRecord {
  name: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private paginatorIntl: MatPaginatorIntl,
    private changeDetectorRef: ChangeDetectorRef,
    private ds: DataService,
    private pop: PopupService,

  ) {
    this.paginator = new MatPaginator(this.paginatorIntl, this.changeDetectorRef);
  }

  displayedColumns: string[] = ['name', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'proof'];
  dataSource: AttendanceRecord[] = [];
 

  ngOnInit(): void {
    this.dataSource = [
      {
        name: 'John Doe Doe Doe',
        monday: 'present',
        tuesday: 'late',
        wednesday: 'absent',
        thursday: 'present',
        friday: 'present',
        saturday: 'late'
      },
      {
        name: 'John Doe',
        monday: 'present',
        tuesday: 'present',
        wednesday: 'absent',
        thursday: 'present',
        friday: 'present',
        saturday: 'present'
      },
      {
        name: 'John Doe',
        monday: 'present',
        tuesday: 'late',
        wednesday: 'absent',
        thursday: 'present',
        friday: 'present',
        saturday: 'late'
      }
    ];
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'present':
        return 'status-present';
      case 'late':
        return 'status-late';
      case 'absent':
        return 'status-absent';
      default:
        return '';
    }
  }

  viewProof() {
    if (this.dialog) {
      this.dialog.open(ViewProofComponent);
    } else {
      console.error('Dialog is not initialized');
    }
  }
}
