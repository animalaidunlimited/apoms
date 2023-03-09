/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StaffScheduleWeekComponent } from './staff-schedule-week.component';

describe('StaffScheduleWeekComponent', () => {
  let component: StaffScheduleWeekComponent;
  let fixture: ComponentFixture<StaffScheduleWeekComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffScheduleWeekComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffScheduleWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
