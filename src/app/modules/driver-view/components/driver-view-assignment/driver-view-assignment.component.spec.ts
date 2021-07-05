import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverViewAssignmentComponent } from './driver-view-assignment.component';

describe('DriverViewAssignmentComponent', () => {
  let component: DriverViewAssignmentComponent;
  let fixture: ComponentFixture<DriverViewAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DriverViewAssignmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverViewAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
