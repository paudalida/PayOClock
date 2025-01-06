import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AdminService } from '../../../../../services/admin/admin.service';
import { DataService } from '../../../../../services/data/data.service';
import { PopupService } from '../../../../../services/popup/popup.service';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss'
})
export class UpdateComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<UpdateComponent>, 
    private as: AdminService,
    private router: Router,
    private ds: DataService,
    private pop: PopupService
  ) {}

  currentDate = {
    payday_start: '',
    payday_end: '',
  };

  new_payday_end = '';

  ngOnInit(): void {
    this.currentDate = this.as.getPayday();
    this.new_payday_end = this.currentDate.payday_end;
  }

  checkDate() {
    const date = new Date(this.new_payday_end);
    const currentPaydayStart = new Date(this.currentDate.payday_start);
    const currentPaydayEnd   = new Date(this.currentDate.payday_end);
    const nextMonth          = new Date(currentPaydayEnd);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    if(date.getTime() < currentPaydayStart.getTime()) {
      this.pop.toastWithTimer('error', 'Payday end date cannot be less than the payday start date', 5);
      this.new_payday_end = '';
    } else if(date.getTime() > nextMonth.getTime()) {
      this.pop.toastWithTimer('error', 'Payday end date cannot be more than a month from the last saved payday', 5);
      this.new_payday_end = '';
    }
  }

  submit(type: string) {
    if(type != 'new' && type != 'current') return;

    let title = '';
    let text = '';

    if(type == 'new') {
      title = 'Update to new date range?';
      text = 'This will update the payslips to a new payroll record, you will no longer have access to the current payslips record.';
    } else if(type == 'current') {
      title = 'Edit current payroll date range?';
      text = 'This will update the payroll to a new date range value.'
    }

    this.pop.swalWithCancel('question', title, text)
      .then((res) => {
        if(res) {
          this.ds.request('POST', 'admin/transactions/payday/update-' + type + '/' + this.currentDate.payday_end, { payday_end: this.new_payday_end}).subscribe({
            next: (res: any) => {
              this.pop.toastWithTimer('success', res.message);
              this.as.setPayday(res.data);
              this.closePopup(true);

              this.updateEmployeesStatus();
            },
            error: (err: any) => {
              this.pop.swalBasic('error', 'Oops! Error updating payday', err.error.message);
            }
          });
        }
      });    
  }

  updateEmployeesStatus() {
    let employees = this.as.getEmployees();

    employees.forEach((element: any) => {
      element.status = 'Pending';
    });
  }

  closePopup(value = false) {
    this.dialogRef.close(value); 
    this.router.navigate(['/admin/payslips']);
  }

}
