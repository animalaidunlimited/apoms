import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleShiftDialogComponent } from './vehicle-shift-dialog.component';

describe('VehicleShiftDialogComponent', () => {
  let component: VehicleShiftDialogComponent;
  let fixture: ComponentFixture<VehicleShiftDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehicleShiftDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleShiftDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
