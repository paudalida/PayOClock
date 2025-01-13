import { Component, OnInit } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { PopupService } from '../../../../services/popup/popup.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { DataService } from '../../../../services/data/data.service';
import { RequestFormComponent } from './request-form/request-form.component';

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
  // allRequests: pendingRequests[] = [
  //   {
  //     request_type: 'Leave',
  //     start_date: '2024-10-13T15:05:00',
  //     end_date: '2024-10-14T15:05:00',
  //     status: 'Pending',
  //     proofs: [
  //       { name: 'medical_certificate.pdf', url: '/assets/images/admin.png' },
  //       { name: 'medical_certificate.pdf', url: '/assets/images/admin.png' },
  //       { name: 'medical_certificate.pdf', url: '/assets/images/admin.png' }
  //     ],
  //     id: 0,
  //     user_id: ''
  //   },
  //   {
  //     request_type: 'Leave',
  //     start_date: '2024-10-13T15:05:00',
  //     end_date: '2024-10-14T15:05:00',
  //     status: 'Pending',
  //     proofs: [
  //       { name: 'medical_certificate.pdf', url: '/assets/images/admin.png' }
  //     ],
  //     id: 1,
  //     user_id: ''
  //   },
  // ];

  // dataSource = new MatTableDataSource<pendingRequests>(this.allRequests);
  columns: string[] = ['request_type', 'start_date', 'end_date', 'status', 'proofs', 'action'];

  constructor(
    private popupService: PopupService,
    private dialog: MatDialog,
    private ds: DataService
  ) { }

  ngOnInit(): void {
    this.ds.request('GET', 'employee/requests').subscribe((res: any) => {
      this.dataSource = new MatTableDataSource(res.data);
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
      const dialogRef = this.dialog.open(RequestFormComponent, { data:  type });

      dialogRef.afterClosed().subscribe((res: any) => {
        if(res) {
          this.dataSource.data = [res, ...this.dataSource.data];
        }
      })
    } else {
      console.error('Dialog is not initialized');
    }
  }
}
