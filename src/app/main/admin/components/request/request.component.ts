import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { PopupService } from '../../../../services/popup/popup.service';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../../../../services/data/data.service';
import { AdminService } from '../../../../services/admin/admin.service';
import { ViewRequestComponent } from './view-request/view-request.component';


interface EmployeeRequest {
  id: number;
  user_id: string;
  full_name: string;
  employee_id: string;
  request_type: string;
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
export class RequestComponent implements OnInit{

  constructor(
    private ds: DataService,
    private as: AdminService,
    private popupService: PopupService,
    private dialog: MatDialog 
  ) { }

  pendingRequests: any = null;
  finishedRequests: any = null;
  employees: any = null;
  

  // allRequests: EmployeeRequest[] = [
  //   {
  //     full_name: 'John Doe',
  //     employee_id: 'E001',
  //     request_type: 'Leave',
  //     start_date: '2024-10-13T15:05:00',
  //     end_date: '2024-10-14T15:05:00',
  //     status: 'Approved',
  //     proofs: [
  //       { name: 'medical_certificate.pdf', url: '/assets/images/admin.png' }
  //     ]
  //   },
  //   {
  //     full_name: 'Jane Smith',
  //     employee_id: 'E002',
  //     request_type: 'Overtime',
  //     start_date: '2024-10-13T15:05:00',
  //     end_date: '2024-10-13T16:05:00',
  //     status: 'Pending',
  //     proofs: []
  //   },
  //   {
  //     full_name: 'Fyangiee Sweet',
  //     employee_id: 'E004',
  //     request_type: 'Overtime',
  //     start_date: '2006-08-05T15:05:00',
  //     end_date: '2006-08-12T15:05:00',
  //     status: 'Pending',
  //     proofs: [
  //       { name: 'medical_certificate.pdf', url: '/assets/images/admin.png' },
  //       { name: 'leave_form.pdf', url: '/assets/images/admin.png' }
  //     ]
  //   },
  //   {
  //     full_name: 'Mike Johnson',
  //     employee_id: 'E003',
  //     request_type: 'Leave',
  //     start_date: '2006-08-05T15:05:00',
  //     end_date: '2006-08-12T15:05:00',
  //     status: 'Denied',
  //     proofs: []
  //   },
  //   {
  //     full_name: 'Emily Davis',
  //     employee_id: 'E004',
  //     request_type: 'Overtime',
  //     start_date: '2006-08-05T15:05:00',
  //     end_date: '2006-08-12T15:05:00',
  //     status: 'Approved',
  //     proofs: [
  //       { name: 'medical_certificate.pdf', url: '/assets/images/admin.png' },
  //       { name: 'leave_form.pdf', url: '/assets/images/admin.png' }
  //     ]
  //   },
  //   {
  //     full_name: 'Chris Lee',
  //     employee_id: 'E005',
  //     request_type: 'Leave',
  //     start_date: '2006-08-05T15:05:00',
  //     end_date: '2006-08-12T15:05:00',
  //     status: 'Cancelled',
  //     proofs: []
  //   }
  // ];
  
  // Separate data sources
  // pendingRequests: EmployeeRequest[] = this.allRequests.filter(request => request.status === 'Pending');
  // finishedRequests: EmployeeRequest[] = this.allRequests.filter(request => request.status !== 'Pending');

  pendingColumns: string[] = ['name', 'employee_id', 'request_type', 'start_date', 'end_date', 'action'];
  finishedColumns: string[] = ['name', 'employee_id', 'request_type', 'start_date', 'end_date', 'status'];

  ngOnInit(): void {
    this.employees = this.as.getEmployees();

    this.ds.request('GET', 'admin/requests').subscribe({
      next: (res: any) => {
        res.data.forEach((element: any) => {
          const matchedEmployee = this.employees.find((employee: any) => employee.id === element.user_id);

          if(matchedEmployee) {
            element.full_name = matchedEmployee.full_name;
            element.employee_id = matchedEmployee.employee_id;
            element.user_id = matchedEmployee.id
          }
        });
        this.pendingRequests = res.data.filter((request: any) => request.status === 0);
        this.finishedRequests = res.data.filter((request: any) => request.status !== 0);
      }
    })
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
          this.updateDataSources(res.data);
        },
        error: (err: any) => {
          this.popupService.swalBasic('error', 'Oops! An Error has occured.', this.popupService.genericErrorMessage);
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
          this.updateDataSources(res.data);
        },
        error: (err: any) => {
          this.popupService.swalBasic('error', 'Oops! An Error has occured.', this.popupService.genericErrorMessage);
        }
      });
    } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.popupService.toastWithTimer('error', 'Denial cancelled.');
    }
  }

  // Update data sources after status change
  updateDataSources(data: any) {
    const index = this.pendingRequests.findIndex((request: any) => request.id === data.id);

    if (index !== -1) {
      this.pendingRequests.splice(index, 1);
      this.pendingRequests = [...this.pendingRequests];
    }
    
    const matchedEmployee = this.employees.find((employee: any) => employee.id === data.user_id);

    if(matchedEmployee) {
      data.full_name = matchedEmployee.full_name;
      data.employee_id = matchedEmployee.employee_id;
      data.user_id = matchedEmployee.id
    }
    this.finishedRequests.unshift(data);
    this.finishedRequests = [...this.finishedRequests];
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
