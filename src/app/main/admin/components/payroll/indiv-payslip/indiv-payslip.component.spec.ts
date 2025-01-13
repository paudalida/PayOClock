import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndivPayslipComponent } from './indiv-payslip.component';

describe('IndivPayslipComponent', () => {
  let component: IndivPayslipComponent;
  let fixture: ComponentFixture<IndivPayslipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IndivPayslipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IndivPayslipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
