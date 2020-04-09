import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { PatientStatusComponent } from './patient-status.component';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormBuilder, FormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OVERLAY_PROVIDERS } from '@angular/cdk/overlay';
import { MaterialModule } from 'src/app/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('PatientStatusComponent', () => {
  let component: PatientStatusComponent;
  let fixture: ComponentFixture<PatientStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule, MaterialModule,
        BrowserAnimationsModule],
      providers: [DatePipe, OVERLAY_PROVIDERS, MatSnackBar],
      declarations: [ PatientStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {

    fixture = TestBed.createComponent(PatientStatusComponent);
    component = fixture.componentInstance;

    let datePipe = new DatePipe("en-US");

    component.patientId = 1;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
