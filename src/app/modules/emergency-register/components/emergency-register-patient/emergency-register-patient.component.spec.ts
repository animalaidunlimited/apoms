import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MediaDialogComponent } from 'src/app/core/components/media-dialog/media-dialog.component';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { RouterTestingModule } from '@angular/router/testing';

import { EmergencyRegisterPatientComponent } from './emergency-register-patient.component';

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
        MatDialogModule
      ],
      declarations: [ EmergencyRegisterPatientComponent ],
      providers: [
        PrintTemplateService,
        { provide: FormBuilder, useValue: formBuilder },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    })
    .compileComponents();
  });

  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
    fixture = TestBed.createComponent(EmergencyRegisterPatientComponent);
    const dialog = TestBed.get(MatDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
