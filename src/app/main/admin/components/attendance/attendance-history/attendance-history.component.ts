import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { DataService } from '../../../../../services/data/data.service';
import { AdminService } from '../../../../../services/admin/admin.service';
import { PopupService } from '../../../../../services/popup/popup.service';
import { ImagePopupComponent } from '../image-popup/image-popup.component';

export interface AttendanceRecord {
  date: string;
  timeIn: string;
  timeOut: string;
  status: string;
  proof: string[];
}

@Component({
  selector: 'app-attendance-history',
  templateUrl: './attendance-history.component.html',
  styleUrls: ['./attendance-history.component.scss']
})
export class AttendanceHistoryComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['date', 'timeIn', 'timeOut', 'status', 'proof'];
  dataSource: AttendanceRecord[] = [];

  constructor(
    private dialog: MatDialog, 
    private router: Router,
    private dialogRef: MatDialogRef<AttendanceHistoryComponent>, 
    private paginatorIntl: MatPaginatorIntl,
    private changeDetectorRef: ChangeDetectorRef,
    private ds: DataService,
    private as: AdminService,
    private pop: PopupService
  ) {}

  ngOnInit(): void {
    this.dataSource = [
      {
        date: '2024-09-12',
        timeIn: '08:00 AM',
        timeOut: '05:00 PM',
        status: 'Present',
        proof: [
          'assets/images/hipster.png',
          'assets/images/landing.png',
          'assets/images/benef.png'
        ]
      },
      {
        date: '2024-09-13',
        timeIn: '09:00 AM',
        timeOut: '06:00 PM',
        status: 'Present',
        proof: [
          'assets/images/no image.png'
        ]
      }, 
      {
        date: '2024-09-13',
        timeIn: '09:00 AM',
        timeOut: '06:00 PM',
        status: 'Present',
        proof: [
          'assets/images/bg1.jpg',
          'assets/images/hacker.jpg'
        ]
      }, 
      {
        date: '2024-09-13',
        timeIn: '09:00 AM',
        timeOut: '06:00 PM',
        status: 'Present',
        proof: [
          'assets/images/bg1.jpg',
          'assets/images/hacker.jpg'
        ]
      }, 
      {
        date: '2024-09-13',
        timeIn: '09:00 AM',
        timeOut: '06:00 PM',
        status: 'Present',
        proof: [
          'assets/images/bg1.jpg',
          'assets/images/hacker.jpg'
        ]
      }
    ];
  }

 closePopup() {
    this.dialogRef.close(); 
    this.router.navigate(['/admin/attendance']);
  }


  openImagePopup(proofImages: string[]): void {
    this.dialog.open(ImagePopupComponent, {
      data: { imageUrls: proofImages } 
    });
  }
}
