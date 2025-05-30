import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { DataService } from '../../services/data/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements AfterViewInit {
  isNavBarVisible = false;
  // visitorCount = 0;
  animatedCount = 0;

  constructor (private el: ElementRef, 
      private ds: DataService,
      private router: Router
  ) {}

  ngOnInit(): void {         // Sa ano Visitor Count 
    this.updateVisitorCount();
  }

  toggleDropdown(event: MouseEvent): void {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    const dropdownMenu = target.nextElementSibling as HTMLElement;

    if (dropdownMenu) {
      dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  toggleNavBar(): void {
    this.isNavBarVisible = !this.isNavBarVisible;
  }

  ngAfterViewInit(): void {
    this.initializeScrollAnimations();
  }


  initializeScrollAnimations(): void {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const target = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          target.classList.add('slideIn');
        } else {
          target.classList.remove('slideIn');
        }
      });
    });
  
    const elementsToAnimate = this.el.nativeElement.querySelectorAll('.animate-on-scroll');
    elementsToAnimate.forEach((element: Element) => {
      observer.observe(element);
    });
  }

  updateVisitorCount(): void {   
    this.ds.requestNoAuth('GET', 'landing').subscribe({
      next: (res: any) => {
        this.animateVisitorCount(res.data.count);

        this.ds.requestNoAuth('POST', 'landing/add').subscribe((res: any) => {
          // do nothing
        });
      }, error: (err: any) => {
        
      }
    });
  }

  animateVisitorCount(target: number): void {
    const duration = 1000; 
    const frameRate = 60; 
    const totalFrames = Math.round((duration / 1000) * frameRate);
    const increment = (target - this.animatedCount) / totalFrames;

    let currentFrame = 0;

    const interval = setInterval(() => {
      currentFrame++;
      this.animatedCount = Math.round(this.animatedCount + increment);

      if (currentFrame >= totalFrames) {
        clearInterval(interval);
        this.animatedCount = target; 
      }
    }, duration / totalFrames);
  }
}  
