import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmployeeService } from '../../../../../services/employee/employee.service';

@Component({
  selector: 'app-toggle-action-admin',
  templateUrl: './toggle-action-admin.component.html',
  styleUrls: ['./toggle-action-admin.component.scss']
})
export class ToggleActionAdminComponent {

  presentState: boolean = false;
  latesState: boolean = false;
  absentState: boolean = false;

  @Input() containerVisibility: Record<'attendance_weekly' | 'payroll' | 'attendance_summary', boolean> = {
    attendance_weekly: true,
    payroll: true, 
    attendance_summary: true,
  };

  // Output to send updated state back to parent component
  @Output() visibilityChanged: EventEmitter<Record<'attendance_weekly' | 'payroll' | 'attendance_summary', boolean>> = new EventEmitter();

  constructor(
    private es: EmployeeService,
    public dialogRef: MatDialogRef<ToggleActionAdminComponent>
  ) {
    this.containerVisibility = es.getConfig();
  }

  toggleState(type: string): void {
    if (type === 'payroll') {
      this.containerVisibility.payroll = !this.containerVisibility.payroll;
    } else if (type === 'summary') {
      this.containerVisibility.attendance_summary = !this.containerVisibility.attendance_summary;
    } else if (type === 'weekly') {
      this.containerVisibility.attendance_weekly = !this.containerVisibility.attendance_weekly;
    }
  }

  closePopup() {
    this.visibilityChanged.emit(this.containerVisibility);
    this.dialogRef.close();
  }
}
