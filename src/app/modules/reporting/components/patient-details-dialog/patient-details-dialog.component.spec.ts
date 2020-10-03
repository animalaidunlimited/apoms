import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDetailsDialogComponent } from './patient-details-dialog.component';

describe('PatientDetailsDialogComponent', () => {
  let component: PatientDetailsDialogComponent;
  let fixture: ComponentFixture<PatientDetailsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientDetailsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
