import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
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
  payrolls: any = null;
  payroll: any = null;
  dateFilter: any = null;
  filterValue = '';
  columns: any;
  selectedRow: any = null;
  isPopupVisible: boolean = true;

   constructor(
    private dialogRef: MatDialogRef<PayrollSumComponent>, 
    private dialog: MatDialog,
    private ds: DataService,
    private as: AdminService,
    private pop: PopupService
  ) {  }

  ngOnInit(): void {
    this.getData();
  }

  get employees() {
    return this.as.getEmployees();
  }

  getData() {
    this.ds.request('GET', 'admin/payrolls').subscribe({
      next: (res: any) => {
        this.columns = res.data.columns;
        this.dateFilter = Object.keys(res.data.columns);
        this.payrolls = res.data.payrolls;
        this.filterValue = this.dateFilter[0];
  
        this.changeData();
      },
      error: (err: any) => {
        this.pop.swalBasic('error', 'Oops! Cannot fetch payrolls!', this.pop.genericErrorMessage);
      }
    });
  }
  
  changeData() {
    this.payroll = this.payrolls[this.filterValue];
  }

  closePopup(): void {
    this.dialogRef.close();
  }
  
}
