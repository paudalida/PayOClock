import { Component, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-image-popup',
  templateUrl: './image-popup.component.html',
  styleUrls: ['./image-popup.component.scss']
})
export class ImagePopupComponent {
  currentIndex = 0;

  constructor(
    public dialogRef: MatDialogRef<ImagePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imageUrls: string[] }
  ) {}

  @HostListener('swiperight', ['$event'])
  onSwipeRight(event: TouchEvent): void {
    this.prevImage();
  }

  @HostListener('swipeleft', ['$event'])
  onSwipeLeft(event: TouchEvent): void {
    this.nextImage();
  }

  onBackgroundClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.dialogRef.close();
    }
  }

  nextImage(): void {
    if (this.currentIndex < this.data.imageUrls.length - 1) {
      this.currentIndex++;
    }
  }

  prevImage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }
}
