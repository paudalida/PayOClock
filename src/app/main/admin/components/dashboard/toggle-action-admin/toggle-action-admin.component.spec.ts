import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleActionAdminComponent } from './toggle-action-admin.component';

describe('ToggleActionAdminComponent', () => {
  let component: ToggleActionAdminComponent;
  let fixture: ComponentFixture<ToggleActionAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToggleActionAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ToggleActionAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
