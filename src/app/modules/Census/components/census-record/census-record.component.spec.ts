import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CensusRecordComponent } from './census-record.component';

describe('CensusRecordComponent', () => {
  let component: CensusRecordComponent;
  let fixture: ComponentFixture<CensusRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CensusRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CensusRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
