import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

interface CardData {
  day: string;
  date: string;
  uploaded_at: string;
  images: string[];
}

@Component({
  selector: 'app-view-proof',
  templateUrl: './view-proof.component.html',
  styleUrls: ['./view-proof.component.scss']
})
export class ViewProofComponent {
  cardData: any = [];
  // cardData: CardData[] = [
  //   {
  //     day: 'Monday',
  //     date: '2024-09-16',
  //     uploaded_at: '10:00 AM',
  //     images: [
  //       'assets/images/hipster.png',
  //       'assets/images/landing.png',
  //       'assets/images/benef.png', 
  //       'assets/images/hipster.png',
  //       'assets/images/landing.png',
  //       'assets/images/benef.png'
  //     ]
  //   },
  //   {
  //     day: 'Monday',
  //     date: '2024-09-16',
  //     uploaded_at: '10:00 AM',
  //     images: [
  //       'assets/images/hipster.png'
  //     ]
  //   },
  //   {
  //     day: 'Monday',
  //     date: '2024-09-16',
  //     uploaded_at: '10:00 AM',
  //     images: [
  //       'assets/images/no image.png'
  //     ]
  //   },
  //   {
  //     day: 'Monday',
  //     date: '2024-09-16',
  //     uploaded_at: '10:00 AM',
  //     images: [
  //       'assets/images/hipster.png',
  //       'assets/images/landing.png',
  //       'assets/images/benef.png'
  //     ]
  //   },
  //   {
  //     day: 'Monday',
  //     date: '2024-09-16',
  //     uploaded_at: '10:00 AM',
  //     images: [
  //       'assets/images/hipster.png',
  //       'assets/images/landing.png',
  //       'assets/images/benef.png'
  //     ]
  //   },
  // ];

  viewMore: { [key: number]: boolean } = {};

  constructor(
    private dialogRef: MatDialogRef<ViewProofComponent>, 
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.cardData = data;
  }

  closePopup() {
    this.dialogRef.close(); 
    this.router.navigate(['/admin/attendance']);
  }

  toggleViewMore(index: number) {
    this.viewMore[index] = !this.viewMore[index];
  }

  isViewMoreVisible(index: number): boolean {
    return (this.cardData[index].images.length > 2) && (this.viewMore[index]);
  }
}
