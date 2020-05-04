import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientCallDialogComponent } from './patient-call-dialog.component';

describe('PatientCallDialogComponent', () => {
  let component: PatientCallDialogComponent;
  let fixture: ComponentFixture<PatientCallDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientCallDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientCallDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
