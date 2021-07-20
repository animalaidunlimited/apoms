import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleShiftComponent } from './vehicle-shift.component';

describe('VehicleShiftComponent', () => {
  let component: VehicleShiftComponent;
  let fixture: ComponentFixture<VehicleShiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehicleShiftComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
