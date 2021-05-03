import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TreatmentListContentComponent } from './treatment-list-content.component';


describe('TreatmentListContentComponent', () => {
  let component: TreatmentListContentComponent;
  let fixture: ComponentFixture<TreatmentListContentComponent>;


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
        RouterTestingModule
      ],
      declarations: [
        TreatmentListContentComponent
      ],
      providers: [
        {provide: ActivatedRoute, useValue: fakeActivatedRoute}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreatmentListContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
