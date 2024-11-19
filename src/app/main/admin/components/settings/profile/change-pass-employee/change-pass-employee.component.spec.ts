import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePassEmployeeComponent } from './change-pass-employee.component';

describe('ChangePassEmployeeComponent', () => {
  let component: ChangePassEmployeeComponent;
  let fixture: ComponentFixture<ChangePassEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChangePassEmployeeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangePassEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
