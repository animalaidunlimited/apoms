import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientStatusComponent } from './patient-status.component';

describe('PatientStatusComponent', () => {
  let component: PatientStatusComponent;
  let fixture: ComponentFixture<PatientStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
