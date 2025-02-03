import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from '../../../../../services/data/data.service';
import { AdminService } from '../../../../../services/admin/admin.service';
import { PopupService } from '../../../../../services/popup/popup.service';
import { MatDialog } from '@angular/material/dialog';

import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-payroll-sum',
  templateUrl: './payroll-sum.component.html',
  styleUrl: './payroll-sum.component.scss'
})
export class PayrollSumComponent implements OnInit {
  fixedColumns = ['Employee ID', 'Name', 'Position', 'Rate'];
  // payrolls: any = null;
  // payroll: any = null;
  // dateFilter: any = null;
  // filterValue = '';
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
