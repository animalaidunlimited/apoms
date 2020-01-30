import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyRecordComponent } from './emergency-record.component';

describe('EmergencyRecordComponent', () => {
  let component: EmergencyRecordComponent;
  let fixture: ComponentFixture<EmergencyRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmergencyRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmergencyRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
