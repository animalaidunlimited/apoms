import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingRecordComponent } from './reporting-record.component';

describe('ReportingRecordComponent', () => {
  let component: ReportingRecordComponent;
  let fixture: ComponentFixture<ReportingRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportingRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportingRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
