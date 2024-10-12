import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { PopupService } from '../../../../services/popup/popup.service';
import { MatDialog } from '@angular/material/dialog';

interface EmployeeRequest {
  full_name: string;
  employee_id: string;
  request_type: string;
  reason: string;
  status: string;
  proofs: { name: string; url: string }[];  
}

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrl: './request.component.scss'
})
export class RequestComponent {

  constructor(
    private popupService: PopupService, 
    private dialog: MatDialog 
  ) { }

  allRequests: EmployeeRequest[] = [
    {
      full_name: 'John Doe',
      employee_id: 'E001',
      request_type: 'Leave',
      reason: 'Medical Leave',
      status: 'Approved',
      proofs: [
        { name: 'medical_certificate.pdf', url: '/assets/images/admin.png' }
      ]
    },
    {
      full_name: 'Jane Smith',
      employee_id: 'E002',
      request_type: 'Overtime',
      reason: 'Project Deadline',
      status: 'Pending',
      proofs: []
    },
    {
      full_name: 'Fyangiee Sweet',
      employee_id: 'E004',
      request_type: 'Overtime',
      reason: 'Extra Hours Needed',
      status: 'Pending',
      proofs: [
        { name: 'medical_certificate.pdf', url: '/assets/images/admin.png' },
        { name: 'leave_form.pdf', url: '/assets/images/admin.png' }
      ]
    },
    {
      full_name: 'Mike Johnson',
      employee_id: 'E003',
      request_type: 'Leave',
      reason: 'Family Emergency',
      status: 'Denied',
      proofs: []
    },
    {
      full_name: 'Emily Davis',
      employee_id: 'E004',
      request_type: 'Overtime',
      reason: 'Extra Hours Needed',
      status: 'Approved',
      proofs: [
        { name: 'medical_certificate.pdf', url: '/assets/images/admin.png' },
        { name: 'leave_form.pdf', url: '/assets/images/admin.png' }
      ]
    },
    {
      full_name: 'Chris Lee',
      employee_id: 'E005',
      request_type: 'Leave',
      reason: 'Vacation',
      status: 'Cancelled',
      proofs: []
    }
  ];
  
  // Separate data sources
  pendingRequests: EmployeeRequest[] = this.allRequests.filter(request => request.status === 'Pending');
  finishedRequests: EmployeeRequest[] = this.allRequests.filter(request => request.status !== 'Pending');

  pendingColumns: string[] = ['name', 'employee_id', 'request_type', 'reason', 'status', 'proof', 'action'];
  finishedColumns: string[] = ['name', 'employee_id', 'request_type', 'reason', 'status', 'proof'];

  // Approve request method
  async approveRequest(element: EmployeeRequest) {
    const isConfirmed = await this.popupService.swalWithCancel(
      'warning',
      'APPROVE REQUEST?',
      'Are you sure you want to approve this request?',
      'Yes',
      'No'
    );
  
    if (isConfirmed) {
      console.log('Approved:', element);
      element.status = 'Approved'; 
      this.updateDataSources(); 
      this.popupService.toastWithTimer('success', 'The request has been approved.');
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
        // result.value contains the reason for denial
        console.log('Denied:', element, 'Reason:', result.value);
        element.status = 'Denied';
        element.reason = result.value; // Store the reason in the request element
        this.updateDataSources();

        // Display a success toast notification
        this.popupService.toastWithTimer('success', 'The request has been denied.');
    } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.popupService.toastWithTimer('error', 'Denial cancelled.');
    }
  }

  // Update data sources after status change
  updateDataSources() {
    this.pendingRequests = this.allRequests.filter(request => request.status === 'Pending');
    this.finishedRequests = this.allRequests.filter(request => request.status !== 'Pending');
  }
}
