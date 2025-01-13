import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AdminService } from '../../../../../services/admin/admin.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-view-request',
  templateUrl: './view-request.component.html',
  styleUrl: './view-request.component.scss'
})

export class ViewRequestComponent {

  constructor(
    private dialogRef: MatDialogRef<ViewRequestComponent>, 
    private as: AdminService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {  }

  // employee = {
  //   full_name: 'John Doe',
  //   employee_id: '12345',
  //   request_type: 'Leave',
  //   start_date: '2023-10-12T08:00:00',
  //   end_date: '2023-10-14T17:00:00',
  //   reason: 'Family Emergency',
  //   image: '',
  //   proofs: [
  //     { name: 'medical_certificate_medical_certificatemedical_certificatemedical_certificate.pdf', url: '/assets/images/admin.png' },
  //     { name: 'leave_application.docx', url: '/assets/images/leave_application.docx' }
  //   ]
  // };

  // employee: any;

  // ngOnInit(): void {
  //   this.employee = this.as.getEmployee();
  // }

  closePopup() {
    this.dialogRef.close(); 
    this.router.navigate(['/admin/request']);
  }
}
