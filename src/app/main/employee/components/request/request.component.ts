import { Component, OnInit } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { PopupService } from '../../../../services/popup/popup.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { LeaveFormComponent } from './leave-form/leave-form.component';
import { OvertimeFormComponent } from './overtime-form/overtime-form.component';
import { DataService } from '../../../../services/data/data.service';

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

  cancelRequest(request: pendingRequests): void {
    // this.popupService.swalWithCancel('question', 'Are you sure you want to cancel this request?')
    //   .then(async (confirmed) => {
    //     if (confirmed) {
    //       this.allRequests = this.allRequests.filter(r => r !== request);
          
    //       this.dataSource.data = this.allRequests;

    //       this.popupService.toastWithTimer('success', 'Your request has been cancelled.');
    //     }
    //   });
  }

  viewProofs(proofs: { name: string; url: string }[]): void {
    console.log('View Proofs clicked');
  }

  leaveForm() {
    if (this.dialog) {
      this.dialog.open(LeaveFormComponent);
    } else {
      console.error('Dialog is not initialized');
    }
  }

  overtimeForm() {
    if (this.dialog) {
      this.dialog.open(OvertimeFormComponent);
    } else {
      console.error('Dialog is not initialized');
    }
  }

  downloadProof(url: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  }
}
