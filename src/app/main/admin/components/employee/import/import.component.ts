import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrl: './import.component.scss'
})
export class ImportComponent {


  constructor(
    private dialogRef: MatDialogRef<ImportComponent>, 
    private router: Router
  ) { }

  closePopup() {
    this.dialogRef.close(); 
    this.router.navigate(['/admin/employees']);
  }

}
