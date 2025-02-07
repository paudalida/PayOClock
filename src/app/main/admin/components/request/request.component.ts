import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { PopupService } from '../../../../services/popup/popup.service';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../../../../services/data/data.service';
import { AdminService } from '../../../../services/admin/admin.service';
import { ViewRequestComponent } from './view-request/view-request.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NotificationService } from '../../../../services/notification/notification.service';

interface EmployeeRequest {
  id: number;
  user_id: string;
  full_name: string;
  employee_id: string;
  request_type: string;
  otherType?: string;  // otherType added to handle custom 'Other' request types
  start_date: string;
  end_date: string;
  status: string;
  proofs: { name: string; url: string }[];
}

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrl: './request.component.scss'
})
export class RequestComponent implements OnInit, AfterViewInit {

  constructor(
    private ds: DataService,
    private as: AdminService,
    private popupService: PopupService,
    private dialog: MatDialog,
    private notif: NotificationService
  ) { }

  pendingRequests = new MatTableDataSource<any>([]);
  finishedRequests = new MatTableDataSource<any>([]);

  @ViewChild('pendingPaginator') pendingPaginator!: MatPaginator;
  @ViewChild('finishedPaginator') finishedPaginator!: MatPaginator;
  
  employees: any = null;

  pendingColumns: string[] = ['name', 'employee_id', 'request_type', 'start_date', 'end_date', 'action'];
  finishedColumns: string[] = ['name', 'employee_id', 'request_type', 'start_date', 'end_date', 'status'];

  ngOnInit(): void {
    this.employees = this.as.getEmployees();

    this.ds.request('GET', 'admin/requests').subscribe({
      next: (res: any) => {
        res.data.forEach((element: any) => {
          const matchedEmployee = this.employees.find((employee: any) => employee.id === element.user_id);

          if (matchedEmployee) {
            element.full_name = matchedEmployee.full_name;
            element.employee_id = matchedEmployee.employee_id;
            element.image = matchedEmployee.image;
            element.user_id = matchedEmployee.id;
          }

          // Check if the request_type is "Other", and if so, replace it with the value of "otherType"
          if (element.request_type === 'Other' && element.otherType) {
            element.request_type = element.otherType;  // Replace the "Other" type with the actual custom type
          }
        });

        // Split data into pending and finished
        this.pendingRequests.data = res.data.filter((request: any) => request.status === 0);
        this.finishedRequests.data = res.data.filter((request: any) => request.status !== 0);

        this.refreshTable();

        this.ds.request('POST', 'admin/read-notifications').subscribe((res: any) => {
          this.notif.setNotifications();
        });
      }
    });
  }

  ngAfterViewInit(): void {
    this.refreshTable();
  }

  refreshTable() {
    this.pendingRequests.paginator = this.pendingPaginator;
    this.finishedRequests.paginator = this.finishedPaginator;
  }

  // Approve request method
  async approveRequest(element: EmployeeRequest) {
    const isConfirmed = await this.popupService.swalWithCancel(
      'question',
      'APPROVE REQUEST?',
      'Are you sure you want to approve this request?',
      'Yes',
      'No'
    );
  
    if (isConfirmed) {
      const data = {
        user_id: element.user_id,
        status: 1
      };

      this.ds.request('POST', 'admin/requests/action/' + element.id, data).subscribe({
        next: (res: any) => {
          this.popupService.toastWithTimer('success', 'The request has been approved.');
          this.updateDataSources(element.id, 1);
        },
        error: (err: any) => {
          this.popupService.swalBasic('error', 'Oops! An Error has occurred.', this.popupService.genericErrorMessage);
        }
      });
    } else {
      this.popupService.toastWithTimer('error', 'Approval cancelled.');
    }
  }

  // Deny request method
  async denyRequest(element: EmployeeRequest) {
    const result = await Swal.fire({
        icon: 'warning',
        title: 'Are you sure you want to deny this request?',
        input: 'textarea',  
        inputPlaceholder: 'Type the reason for denial here...',  
        inputAttributes: {
            'aria-label': 'Reason for denial'
        },
        showCancelButton: true,
        confirmButtonText: 'Yes, deny it',
        cancelButtonText: 'No',
        reverseButtons: true, 
        customClass: {
            confirmButton: 'btn-primary'
        },
        preConfirm: (inputValue) => {
            if (!inputValue) {
                Swal.showValidationMessage('Please provide a reason for denial');
                return false;
            }
            return inputValue;
        },
        willOpen: () => {
            document.body.style.overflowY = 'scroll'; 
        },
        willClose: () => {
            document.body.style.overflowY = 'scroll'; 
        },
    });

    if (result.isConfirmed && result.value) {
      const data = {
        user_id: element.user_id,
        status: 2,
        denial_reason: result.value
      };

      this.ds.request('POST', 'admin/requests/action/' + element.id, data).subscribe({
        next: (res: any) => {
          this.popupService.toastWithTimer('success', 'The request has been denied.');
          this.updateDataSources(element.id, 2, result.value);
        },
        error: (err: any) => {
          this.popupService.swalBasic('error', 'Oops! An Error has occurred.', this.popupService.genericErrorMessage);
        }
      });
    } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.popupService.toastWithTimer('error', 'Denial cancelled.');
    }
  }

  // Update data sources after status change
  updateDataSources(id: number, status: number, denial_reason: string = '') {
    const index = this.pendingRequests.data.findIndex((request: any) => request.id === id);

    if (index !== -1) {
      let record = this.pendingRequests.data[index];
      record.status = status;
      record.denial_reason = denial_reason;

      // If request type is 'Other', replace with the "otherType" value
      if (record.request_type === 'Other' && record.otherType) {
        record.request_type = record.otherType;
      }

      // Remove from pending
      this.pendingRequests.data.splice(index, 1);
      this.pendingRequests.data = [...this.pendingRequests.data];

      // Add to finished
      this.finishedRequests.data.unshift(record);
      this.finishedRequests.data = [...this.finishedRequests.data];
    }
  }

  viewRequest(employeeData: any) {
    if (this.dialog) {
      this.dialog.open(ViewRequestComponent, {
        data: employeeData     
      });
    } else {
      console.error('Dialog is not initialized');
    }
  }
}
