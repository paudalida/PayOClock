import { Component } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { EditProfileComponent } from '../popup/edit-profile/edit-profile.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {


  constructor (
    private dialog: MatDialog
  
  ) {}

  openDialog() {
    if (this.dialog) {
      this.dialog.open(EditProfileComponent);
    } else {
      console.error('Dialog is not initialized');
    }
  }
}
