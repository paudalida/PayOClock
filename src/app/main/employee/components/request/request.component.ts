import { Component, OnInit } from '@angular/core';
import { PopupService } from '../../../../services/popup/popup.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { DataService } from '../../../../services/data/data.service';
import { RequestFormComponent } from './request-form/request-form.component';
import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';

interface pendingRequests {
  id: number;
  user_id: string;
  request_type: string;
  start_date: string;
  end_date: string;
  status: string;
  proofs: { name: string; url: string }[];
}

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss']
})
export class RequestComponent implements OnInit {

  requests: any;
  dataSource: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  columns: string[] = ['request_type', 'start_date', 'end_date', 'status', 'proofs', 'action'];
  leaveCredits = 0;
  isLoading = true;

  constructor(
    private popupService: PopupService,
    private dialog: MatDialog,
    private ds: DataService
  ) { }

  ngOnInit(): void {
    this.ds.request('GET', 'employee/requests').subscribe((res: any) => {
      this.dataSource = new MatTableDataSource(res.data.requests);
      this.dataSource.paginator = this.paginator;

      this.leaveCredits = res.data.leave_credits;
      this.isLoading = false;
    })
  }

  cancelRequest(id: number): void {
    this.popupService.swalWithCancel('question', 'Are you sure you want to cancel this request?')
      .then(async (confirmed) => {
        if (confirmed) {
          this.ds.request('POST', 'employee/time-requests/cancel/' + id).subscribe({
            next: (res: any) => {
              this.popupService.toastWithTimer('success', res.message);

              let record = this.dataSource.data.find((element: any) => element.id === id);

              record.status = 3;

              this.dataSource.data = [...this.dataSource.data];
              this.leaveCredits = res.data.leave_credits;
            },
            error: (err: any) => {
              this.popupService.swalBasic('error', this.popupService.genericErrorTitle, err.error.message);
            }
          });
        }
      });
  }

  openForm(type: string) {
    if (this.dialog) {
      const dialogRef = this.dialog.open(RequestFormComponent, { data:  { type, leaveCredits: this.leaveCredits }});

      dialogRef.afterClosed().subscribe((res: any) => {
        if(res) {
          this.dataSource.data = [res.record, ...this.dataSource.data];
          this.leaveCredits = res.leave_credits;
        }
      })
    } else {
      console.error('Dialog is not initialized');
    }
  }
}
