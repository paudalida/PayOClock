import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import { EmployeeService } from '../../../../../services/employee/employee.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-toggle-action',
  templateUrl: './toggle-action.component.html',
  styleUrls: ['./toggle-action.component.scss']
})
export class ToggleActionComponent {

  // State to hold the toggle statuses
  presentState: boolean = false;
  latesState: boolean = false;
  absentState: boolean = false;

  containerVisibility: any;

  // Output to send updated state back to parent component
  @Output() visibilityChanged = new EventEmitter<Record<'present' | 'absences' | 'announcement' | 'announcementHistory', boolean>>();


  constructor(
    private es: EmployeeService,
    public dialogRef: MatDialogRef<ToggleActionComponent>
  ) {
    this.containerVisibility = es.getConfig();
  }

  toggleState(type: string): void {
    if (type === 'present') {
      this.containerVisibility.present = !this.containerVisibility.present;
    } else if (type === 'absences') {
      this.containerVisibility.absences = !this.containerVisibility.absences;
    } else if (type === 'announcement') {
      this.containerVisibility.announcement = !this.containerVisibility.announcement;
      this.containerVisibility.announcementHistory = !this.containerVisibility.announcementHistory;
    } else if (type === 'announcementHistory') {
      this.containerVisibility.announcementHistory = !this.containerVisibility.announcementHistory;
    }
  }

  closePopup() {  
    // Emit updated state back to the parent
    this.visibilityChanged.emit(this.containerVisibility);
    this.dialogRef.close();
  }
}

