import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AdminService } from '../../../../../services/admin/admin.service';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss'
})
export class UpdateComponent {

  constructor(
    private dialogRef: MatDialogRef<UpdateComponent>, 
    private as: AdminService,
    private router: Router
  ) {}

  closePopup() {
    this.dialogRef.close(); 
    this.router.navigate(['/admin/payslips']);
  }

}
