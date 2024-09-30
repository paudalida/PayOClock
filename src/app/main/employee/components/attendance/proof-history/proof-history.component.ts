import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

interface CardData {
  day: string;
  date: string;
  timeUploaded: string;
  images: string[];
}

@Component({
  selector: 'app-proof-history',
  templateUrl: './proof-history.component.html',
  styleUrl: './proof-history.component.scss'
})
export class ProofHistoryComponent {

  cardData: CardData[] = [
    {
      day: 'Monday',
      date: '2024-09-16',
      timeUploaded: '10:00 AM',
      images: [
        'assets/images/hipster.png',
        'assets/images/landing.png',
        'assets/images/benef.png', 
        'assets/images/hipster.png',
        'assets/images/landing.png',
        'assets/images/benef.png'
      ]
    },
    {
      day: 'Monday',
      date: '2024-09-16',
      timeUploaded: '10:00 AM',
      images: [
        'assets/images/hipster.png'
      ]
    },
    {
      day: 'Monday',
      date: '2024-09-16',
      timeUploaded: '10:00 AM',
      images: [
        'assets/images/no image.png'
      ]
    },
    {
      day: 'Monday',
      date: '2024-09-16',
      timeUploaded: '10:00 AM',
      images: [
        'assets/images/hipster.png',
        'assets/images/landing.png',
        'assets/images/benef.png'
      ]
    },
    {
      day: 'Monday',
      date: '2024-09-16',
      timeUploaded: '10:00 AM',
      images: [
        'assets/images/hipster.png',
        'assets/images/landing.png',
        'assets/images/benef.png'
      ]
    },
  ];

  viewMore: { [key: number]: boolean } = {};

  constructor(
    private dialogRef: MatDialogRef<ProofHistoryComponent>, 
    private router: Router
  ) { }

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
