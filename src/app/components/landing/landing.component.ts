import { Component, AfterViewInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements AfterViewInit {
  isNavBarVisible = false;

  constructor(private el: ElementRef) {}

  toggleDropdown(event: MouseEvent): void {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    const dropdownMenu = target.nextElementSibling as HTMLElement;

    if (dropdownMenu) {
      dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    }
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
}  
