import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MatLegacyDialogModule as MatDialogModule, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material-module';

import { TreatmentRecordComponent } from './treatment-record.component';

@Component({
  selector: 'confirmation-dialog',
  template: '<p>Mock confirmation-dialog Component</p>'
})
class MockConfirmationDialogComponent {}

describe('TreatmentRecordComponent', () => {
  let component: TreatmentRecordComponent;
  let fixture: ComponentFixture<TreatmentRecordComponent>;

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close')
  };

let dialog: MatDialogRef<MockConfirmationDialogComponent>;

const dialogData = {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MaterialModule,
        BrowserAnimationsModule
      ],
        providers: [
          MatSnackBar,
          DatePipe,
          {
              provide: MAT_DIALOG_DATA,
              useValue: dialogData },
            {
            provide: MatDialogRef,
            useValue: mockDialogRef
          }
      ],
      declarations: [ TreatmentRecordComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
    fixture = TestBed.createComponent(TreatmentRecordComponent);
    component = fixture.componentInstance;

    dialog = TestBed.get(MatDialog);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
