import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyCaseOutcomeComponent } from './emergency-case-outcome.component';

describe('EmergencyCaseOutcomeComponent', () => {
  let component: EmergencyCaseOutcomeComponent;
  let fixture: ComponentFixture<EmergencyCaseOutcomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmergencyCaseOutcomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmergencyCaseOutcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
