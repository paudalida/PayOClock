import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-toggle-action-admin',
  templateUrl: './toggle-action-admin.component.html',
  styleUrls: ['./toggle-action-admin.component.scss']
})
export class ToggleActionAdminComponent {

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<ToggleActionAdminComponent>
  ) {}


  closePopup() {
    this.dialogRef.close();
    this.router.navigate(['/admin/dashboard']);
  }
}
