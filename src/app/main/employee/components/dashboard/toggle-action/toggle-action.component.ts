import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
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

  @Input() containerVisibility: Record<'present' | 'lates' | 'absences' | 'announcement' | 'announcementHistory', boolean> = {
    present: true,
    lates: true,
    absences: true,
    announcement: true,
    announcementHistory: false
  };

  // Output to send updated state back to parent component
  @Output() visibilityChanged: EventEmitter<Record<'present' | 'lates' | 'absences' | 'announcement' | 'announcementHistory', boolean>> = new EventEmitter();


  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<ToggleActionComponent>
  ) {}

  toggleState(type: string): void {
    if (type === 'present') {
      this.containerVisibility.present = !this.containerVisibility.present;
    } else if (type === 'lates') {
      this.containerVisibility.lates = !this.containerVisibility.lates;
    } else if (type === 'absences') {
      this.containerVisibility.absences = !this.containerVisibility.absences;
    } else if (type === 'announcement') {
      this.containerVisibility.announcement = !this.containerVisibility.announcement;
    } else if (type === 'announcementHistory') {
      this.containerVisibility.announcementHistory = !this.containerVisibility.announcementHistory;
    }
  
    // Emit updated state back to the parent
    this.visibilityChanged.emit(this.containerVisibility);
  }

  closePopup() {
    this.dialogRef.close();
    this.router.navigate(['/employee/dashboard']);
  }
}

