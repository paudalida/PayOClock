import { Directive, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appAccountingFormat]'
})
export class AccountingFormatDirective {

  constructor(private el: ElementRef, private control: NgControl, private renderer: Renderer2) {
    
  }

  private formatNumber(value: string): string {
    if (!value) return '';
    const num = Number(value.replace(/[^0-9.-]/g, '')); // safer parse
    if (isNaN(num)) return '';
    return `₱${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }


  private unformatNumber(value: string): string {
    if (!value) return '';
    return value.toString().replace(/,/g, '');
  }

  @HostListener('focus')
  onFocus() {
    const value = this.el.nativeElement.value;
    this.el.nativeElement.value = this.unformatNumber(value);
  }

  @HostListener('blur')
  onBlur() {
    const value = this.el.nativeElement.value;
    const unformatted = this.unformatNumber(value);
    const formatted = this.formatNumber(unformatted);

    // Delay setting formatted value to avoid Angular race condition
    setTimeout(() => {
      this.el.nativeElement.value = formatted;
    });

    if (this.control && this.control.control) {
      this.control.control.setValue(unformatted, { emitEvent: false });
      this.control.control.markAsDirty();
      this.control.control.markAsTouched();
    }
  }


  @HostListener('input', ['$event'])
  onInput(event: any) {
    const rawValue = this.unformatNumber(event.target.value);

    if (this.control && this.control.control) {
      this.control.control.setValue(rawValue, { emitEvent: false });
    }
  }
}
