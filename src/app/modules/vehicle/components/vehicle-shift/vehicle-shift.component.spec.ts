import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from 'src/app/material-module';

import { VehicleShiftComponent } from './vehicle-shift.component';

describe('VehicleShiftComponent', () => {
  let component: VehicleShiftComponent;
  let fixture: ComponentFixture<VehicleShiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[
        HttpClientTestingModule,
        MaterialModule,
      ],
      declarations: [ VehicleShiftComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleShiftComponent);
    component = fixture.componentInstance;

    component.shiftDate = new Date();
    component.vehicle =   {
                            vehicleId: 1,
                            vehicleType: "van",
                            vehicleNumber: "A1",
                            vehicleStatus: "Active",
                            vehicleTypeId: 1,
                            vehicleStatusId: 1,
                            registrationNumber: "RJ123235",
                            largeAnimalCapacity: 1,
                            smallAnimalCapacity: 4,
                            minRescuerCapacity: 1,
                            maxRescuerCapacity: 3,
                            currentVehicleStaff: "",
                            imageURL: "",
                            vehicleColour: "yellow",
                            streetTreatVehicle: false,
                            streetTreatDefaultVehicle: false
                            }

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
