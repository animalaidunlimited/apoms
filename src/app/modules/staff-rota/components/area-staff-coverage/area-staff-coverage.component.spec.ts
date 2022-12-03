/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AreaStaffCoverageComponent } from './area-staff-coverage.component';

describe('AreaStaffCoverageComponent', () => {
  let component: AreaStaffCoverageComponent;
  let fixture: ComponentFixture<AreaStaffCoverageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AreaStaffCoverageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AreaStaffCoverageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
