import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminService } from '../../../../../services/admin/admin.service';

import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-payroll-sum',
  templateUrl: './payroll-sum.component.html',
  styleUrl: './payroll-sum.component.scss'
})
export class PayrollSumComponent implements OnInit {
  fixedColumns = ['Employee ID', 'Name', 'Position', 'Rate'];
  columns: any;
  selectedRow: any = null;
  isPopupVisible: boolean = true;

   constructor(
    private dialogRef: MatDialogRef<PayrollSumComponent>,
    private as: AdminService,
    @Inject(MAT_DIALOG_DATA) public payroll: any
  ) {  }

  ngOnInit(): void {
    
  }

  closePopup(): void {
    this.dialogRef.close();
  }
  
}
