import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProofHistoryComponent } from './proof-history.component';

describe('ProofHistoryComponent', () => {
  let component: ProofHistoryComponent;
  let fixture: ComponentFixture<ProofHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProofHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProofHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
