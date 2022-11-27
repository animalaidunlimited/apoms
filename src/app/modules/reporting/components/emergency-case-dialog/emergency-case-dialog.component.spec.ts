import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material-module';

import { EmergencyCaseDialogComponent } from './emergency-case-dialog.component';

@Component({
  selector: 'app-release-assign-dialog',
  template: '<p>Mock emergency-case Component</p>'
})
class MockEmergencyCaseDialogComponent {}

describe('EmergencyCaseDialogComponent', () => {
  let component: EmergencyCaseDialogComponent;
  let fixture: ComponentFixture<EmergencyCaseDialogComponent>;

  const emergencyRecordTable = {
    emergencyNumber: 1,
    callDateTime: new Date(),
    animalType: '',
    tagNumber : '',
    location : '',
    dispatcher: '',
    staff1: '',
    staff2: '',
    callOutcome: ''
};

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close')
  };

  const dialogData = {
    emergencyCases: [emergencyRecordTable]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule,
        BrowserAnimationsModule,
        MaterialModule ],
      declarations: [ EmergencyCaseDialogComponent ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData },
        {
        provide: MatDialogRef,
        useValue: mockDialogRef
      }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmergencyCaseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
