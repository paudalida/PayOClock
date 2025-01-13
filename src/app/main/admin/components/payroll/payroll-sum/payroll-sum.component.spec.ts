import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollSumComponent } from './payroll-sum.component';

describe('PayrollSumComponent', () => {
  let component: PayrollSumComponent;
  let fixture: ComponentFixture<PayrollSumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayrollSumComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PayrollSumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
