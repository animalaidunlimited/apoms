import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';

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

  let patientId:number;
  let tagNumber:string;

  const dialogData = {
    patientId,
    tagNumber
  };

  let dialog: MatDialogRef<MockPatientEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, HttpClientTestingModule,
        RouterTestingModule],

      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData },
        {
        provide: MatDialogRef,
        useValue: mockDialogRef
      }],
      declarations: [ SearchResultCardComponent, MockPatientEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultCardComponent);
    component = fixture.componentInstance;

    dialog = TestBed.get(MatDialog);

    component.record = {
      EmergencyCaseId: 0,
      EmergencyNumber: 0,
      CallDateTime: '',
      CallerId: 0,
      Name: '',
      Number: '',
      AnimalTypeId: 0,
      AnimalType: '',
      PatientId: 0,
      TagNumber: '',
      CallOutcomeId: 0,
      CallOutcome: '',
      sameAsNumber: 0,
      Location: '',
      Latitude: 0,
      Longitude: 0,
      CurrentLocation: ''};

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
