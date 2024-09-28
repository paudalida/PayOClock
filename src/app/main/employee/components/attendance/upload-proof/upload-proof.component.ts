import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AttendanceComponent } from '../attendance.component';

@Component({
  selector: 'app-upload-proof',
  templateUrl: './upload-proof.component.html',
  styleUrl: './upload-proof.component.scss'
})
export class UploadProofComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<UploadProofComponent>, 
    private router: Router
  ) {}

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  closePopup() {
    this.dialogRef.close(); 
    this.router.navigate(['/employee/attendance']);
  }

}
