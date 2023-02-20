/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RotationPositionComponent } from './rotation-position.component';

describe('RotationPositionComponent', () => {
  let component: RotationPositionComponent;
  let fixture: ComponentFixture<RotationPositionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RotationPositionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RotationPositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
