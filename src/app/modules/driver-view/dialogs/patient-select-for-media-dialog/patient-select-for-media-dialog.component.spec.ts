import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { PatientSelectForMediaDialogComponent } from './patient-select-for-media-dialog.component';

describe('PatientSelectForMediaDialogComponent', () => {
  let component: PatientSelectForMediaDialogComponent;
  let fixture: ComponentFixture<PatientSelectForMediaDialogComponent>;
  const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();
  const dialogData = {};

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close'),
};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[MatDialogModule],
      providers:[ { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: UntypedFormBuilder, useValue: formBuilder }],
      declarations: [ PatientSelectForMediaDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
    fixture = TestBed.createComponent(PatientSelectForMediaDialogComponent);
    component = fixture.componentInstance;

    component.formGroup = fb.group({});

    component.patients = [{
      animalType: 'Dog',
      animalTypeId: 5,
      updated: false,
      tagNumber: 'B105',
      patientId: 1254,
      problems:[{
        problemId:1,
        problem:'Anorexia'
      }],
      callOutcome: {
        CallOutcome: {
          CallOutcome:'Admission',
          CallOutcomeId:1,
          SortOrder:1
        },
        sameAsNumber:0,
      },
      createdDate:'2021-12-21 14:55:16',
      GUID: '123456789',
      largeAnimal:0,
      problemsString:'Anorexia',
      duplicateTag:false,
      patientStatusId:1,
      patientStatusDate: '2021-12-21 14:55:45',
      deleted: false,
      isAdmission: false,
      admissionArea: 1,
      admissionAccepted: true,
      treatmentPriority: 1,
      mediaCount: 0
    }];

    fixture.detectChanges();

  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
