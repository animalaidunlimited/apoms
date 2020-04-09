import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { PatientRecordComponent } from './patient-record.component';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { SearchRecordTab } from 'src/app/core/models/search-record-tab';
import { MaterialModule } from 'src/app/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('PatientRecordComponent', () => {
  let component: PatientRecordComponent;
  let fixture: ComponentFixture<PatientRecordComponent>;

  let incomingPatient:SearchRecordTab = {
    id:1,
    value: "New Case",
    emergencyCaseId: 1,
    emergencyNumber: 1,
    patientId: 1,
    tagNumber: "H100",
    currentLocation: "",
    callDateTime: "2020-04-09T12:52",
    callOutcome: 1,
    icon: "close"
  };

  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientRecordComponent ],
      imports: [ MaterialModule, FormsModule, ReactiveFormsModule, BrowserAnimationsModule ],
      providers: [ { provide: FormBuilder, useValue: formBuilder } ]
    })
    .compileComponents();
  }));

  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
    fixture = TestBed.createComponent(PatientRecordComponent);
    component = fixture.componentInstance;

    component.incomingPatient = incomingPatient;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
