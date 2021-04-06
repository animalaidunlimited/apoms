import { MaterialModule } from 'src/app/material-module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { CensusListContentComponent } from './census-list-content.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('CensusListContentComponent', () => {
  let component: CensusListContentComponent;
  let fixture: ComponentFixture<CensusListContentComponent>;


  const patientCountInArea = {
    area : 'A-Kennel',
    lowPriority: 1,
      normalPriority: 1,
      highPriority: 1,
      urgentPriority: 1,
      infants: 1,
      adults: 1,
      count : 1
    };

    const censusPrintContent = {
      area: 'A-Kennel',
      displayColumns: ['TagNumber'],
      printList: [patientCountInArea]
    };

    const fakeActivatedRoute = { snapshot: {
      params: {
        censusList: JSON.stringify(censusPrintContent)
      }
    }};

  beforeEach(async () => {
    TestBed.configureTestingModule({

      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MaterialModule,
        BrowserAnimationsModule
      ],
      declarations: [
        CensusListContentComponent
      ],
      providers: [
        {provide: ActivatedRoute, useValue: fakeActivatedRoute}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CensusListContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
