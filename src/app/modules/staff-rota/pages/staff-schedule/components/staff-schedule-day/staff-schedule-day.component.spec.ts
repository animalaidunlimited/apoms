/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StaffScheduleDayComponent } from './staff-schedule-day.component';

describe('StaffScheduleDayComponent', () => {
  let component: StaffScheduleDayComponent;
  let fixture: ComponentFixture<StaffScheduleDayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffScheduleDayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffScheduleDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
