import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-toggle-action-admin',
  templateUrl: './toggle-action-admin.component.html',
  styleUrls: ['./toggle-action-admin.component.scss']
})
export class ToggleActionAdminComponent {

  presentState: boolean = false;
  latesState: boolean = false;
  absentState: boolean = false;

  @Input() containerVisibility: Record<'employee' | 'pending' | 'processed' | 'attendance' | 'payroll' | 'summary', boolean> = {
    employee: true,
    pending: true,
    processed: true,
    attendance: true,
    payroll: true, 
    summary: true,
  };

  // Output to send updated state back to parent component
  @Output() visibilityChanged: EventEmitter<Record<'employee' | 'pending' | 'processed' | 'attendance' | 'payroll' | 'summary', boolean>> = new EventEmitter();


  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<ToggleActionAdminComponent>
  ) {}

  toggleState(type: string): void {
    if (type === 'employee') {
      this.containerVisibility.employee = !this.containerVisibility.employee;
    } else if (type === 'pending') {
      this.containerVisibility.pending = !this.containerVisibility.pending;
    } else if (type === 'processed') {
      this.containerVisibility.processed = !this.containerVisibility.processed;
    } else if (type === 'attendance') {
      this.containerVisibility.attendance = !this.containerVisibility.attendance;
    } else if (type === 'payroll') {
      this.containerVisibility.payroll = !this.containerVisibility.payroll;
    } else if (type === 'summary') {
      this.containerVisibility.summary = !this.containerVisibility.summary;
    }
  
    // Emit updated state back to the parent
    this.visibilityChanged.emit(this.containerVisibility);
  }

  closePopup() {
    this.dialogRef.close();
    this.router.navigate(['/admin/dashboard']);
  }
}
