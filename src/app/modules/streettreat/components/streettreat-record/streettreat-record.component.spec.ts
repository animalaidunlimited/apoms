import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreetTreatRecordComponent } from './streettreat-record.component';

describe('StreettreatRecordComponent', () => {
  let component: StreetTreatRecordComponent;
  let fixture: ComponentFixture<StreetTreatRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StreetTreatRecordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StreetTreatRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
