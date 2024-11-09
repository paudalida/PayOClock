import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-proof-history',
  templateUrl: './proof-history.component.html',
  styleUrl: './proof-history.component.scss'
})
export class ProofHistoryComponent {

  cardData: any;

  viewMore: { [key: number]: boolean } = {};

  constructor(
    private dialogRef: MatDialogRef<ProofHistoryComponent>, 
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.cardData = data;
  }

  closePopup() {
    this.dialogRef.close(); 
    this.router.navigate(['/employee/attendance']);
  }

  toggleViewMore(index: number) {
    this.viewMore[index] = !this.viewMore[index];
  }

  isViewMoreVisible(index: number): boolean {
    return (this.cardData[index].images.length > 2) && (this.viewMore[index]);
  }
}
