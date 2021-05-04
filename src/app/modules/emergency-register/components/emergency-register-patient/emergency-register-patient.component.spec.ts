import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MediaDialogComponent } from 'src/app/core/components/media-dialog/media-dialog.component';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { RouterTestingModule } from '@angular/router/testing';

import { EmergencyRegisterPatientComponent } from './emergency-register-patient.component';
import { routes } from 'src/app/app-routing.module';
import { MaterialModule } from 'src/app/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EmergencyCaseOutcomeComponent } from '../emergency-case-outcome/emergency-case-outcome.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('EmergencyRegisterPatientComponent', () => {
  let component: EmergencyRegisterPatientComponent;
  let fixture: ComponentFixture<EmergencyRegisterPatientComponent>;

  const formBuilder: FormBuilder = new FormBuilder();

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close'),
};
const dialogData = {};

let dialog: MatDialogRef<MediaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MaterialModule,
        RouterTestingModule.withRoutes(routes),
        BrowserAnimationsModule
      ],
      declarations: [ EmergencyRegisterPatientComponent, EmergencyCaseOutcomeComponent ],
      providers: [
        PrintTemplateService,
        { provide: FormBuilder, useValue: formBuilder },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
    fixture = TestBed.createComponent(EmergencyRegisterPatientComponent);
    const dialog = TestBed.get(MatDialog);

    component = fixture.componentInstance;

    component.patientForm = fb.group({
      animalType: 'Dog',
      animalTypeId: 10,
      updated: false,
      tagNumber: 'A378',
      patientId: 230719,
      problems: fb.array([]),
      callOutcome: fb.group({
        CallOutcomeId: 1,
        CallOutcome: 'Admission'
      })
    });

    component.patientIndex = 0;

    fixture.detectChanges();

  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
