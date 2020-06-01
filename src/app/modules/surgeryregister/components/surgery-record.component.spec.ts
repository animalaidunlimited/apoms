import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgeryRecordComponent } from './surgery-record.component';

describe('SurgeryRecordComponent', () => {
  let component: SurgeryRecordComponent;
  let fixture: ComponentFixture<SurgeryRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurgeryRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurgeryRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
