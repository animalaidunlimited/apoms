import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from 'src/app/material-module';

import { SearchStreetTreatResultCardComponent } from './search-streettreat-result-card.component';

describe('SearchStreetTreatResultCardComponent', () => {
  let component: SearchStreetTreatResultCardComponent;
  let fixture: ComponentFixture<SearchStreetTreatResultCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[MaterialModule],
      declarations: [ SearchStreetTreatResultCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchStreetTreatResultCardComponent);
    component = fixture.componentInstance;

    component.record = {
      AnimalType: 'Dog',
      AnimalTypeId: 10,
      CallDateTime: 20210319,
      CallOutcome: undefined,
      CallOutcomeId: undefined,
      CallerId: 17,
      CurrentLocation: undefined,
      EmergencyCaseId: 1,
      EmergencyNumber: 8,
      StreetTreatCaseId: 12,
      Latitude: 74.0000,
      Location: 'Udaipur',
      Longitude: 24.000,
      MediaCount: 1,
      Name: 'Bobafet',
      Number: '333333',
      PatientId: 72,
      NextVisit: 'manana',
      TagNumber: 'tag',
      UserName: 'Boba',
      ReleaseStatus: 'Released'
  }

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
