import { Component, Inject } from '@angular/core';
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

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<ToggleActionComponent>
  ) {}

  // Function to handle the toggle action for each button
  toggleState(type: string): void {
    if (type === 'present') {
      this.presentState = !this.presentState;
    } else if (type === 'lates') {
      this.latesState = !this.latesState;
    } else if (type === 'absent') {
      this.absentState = !this.absentState;
    }
  }

  closePopup() {
    this.dialogRef.close();
    this.router.navigate(['/employee/dashboard']);
  }
}

