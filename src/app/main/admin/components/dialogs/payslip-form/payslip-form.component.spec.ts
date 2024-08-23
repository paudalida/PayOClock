import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayslipFormComponent } from './payslip-form.component';

describe('PayslipFormComponent', () => {
  let component: PayslipFormComponent;
  let fixture: ComponentFixture<PayslipFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayslipFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PayslipFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
