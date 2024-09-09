import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProofComponent } from './view-proof.component';

describe('ViewProofComponent', () => {
  let component: ViewProofComponent;
  let fixture: ComponentFixture<ViewProofComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewProofComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewProofComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
