import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollFormsComponent } from './payroll-forms.component';

describe('PayrollFormsComponent', () => {
  let component: PayrollFormsComponent;
  let fixture: ComponentFixture<PayrollFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayrollFormsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PayrollFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
