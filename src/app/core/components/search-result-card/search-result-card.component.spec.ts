import { MaterialModule } from 'src/app/material-module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { CallerDetails } from '../../models/emergency-record';


import { SearchResultCardComponent } from './search-result-card.component';

@Component({
  selector: 'patient-edit',
  template: '<p>Mock patient-edit Component</p>'
})
class MockPatientEditComponent {}

describe('SearchResultCardComponent', () => {
  let component: SearchResultCardComponent;
  let fixture: ComponentFixture<SearchResultCardComponent>;

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close')
  };

  const patientId = 0;
  const tagNumber = '';

  const dialogData = {
    patientId,
    tagNumber
  };

  let dialog: MatDialogRef<MockPatientEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, HttpClientTestingModule,
        RouterTestingModule, MaterialModule],

      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData },
        {
        provide: MatDialogRef,
        useValue: mockDialogRef
      }],
      declarations: [ SearchResultCardComponent, MockPatientEditComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultCardComponent);
    component = fixture.componentInstance;

    dialog = TestBed.get(MatDialog);

    const caller:CallerDetails = {
      callerId: 0,
      callerName: '',
      callerNumber: '',
      callerAlternativeNumber: ''
    };

    component.record = {
      EmergencyCaseId: 0,
      EmergencyNumber: 0,
      CallDateTime: '',
      callerDetails: [caller],
      AnimalTypeId: 0,
      AnimalType: '',
      PatientId: 0,
      TagNumber: '',
      CallOutcomeId: 0,
      MediaCount: 0,
      CallOutcome: '',
      sameAsNumber: 0,
      Location: '',
      latLngLiteral: {
        lat:0,
        lng:0
      },
      CurrentLocation: ''};

    component.record = component.record;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
