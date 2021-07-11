import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleStaffAssignerComponent } from './vehicle-staff-assigner.component';

describe('VehicleStaffAssignerComponent', () => {
  let component: VehicleStaffAssignerComponent;
  let fixture: ComponentFixture<VehicleStaffAssignerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehicleStaffAssignerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleStaffAssignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
