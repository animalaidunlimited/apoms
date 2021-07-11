import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vehicle } from 'src/app/core/models/driver-view';
import { VehicleShift } from 'src/app/core/models/vehicle';
import { VehicleService } from '../../services/vehicle.service';



@Component({
  selector: 'app-vehicle-shift',
  templateUrl: './vehicle-shift.component.html',
  styleUrls: ['./vehicle-shift.component.scss']
})
export class VehicleShiftComponent implements OnInit {

  @Input() vehicle!: Vehicle;
  hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
  shifts$!: Observable<VehicleShift[]>;

  constructor(
    private vehicleService: VehicleService
  ) { }

  ngOnInit(): void {

    this.shifts$ = this.vehicleService.getVehicleShifts().pipe(map(shifts => shifts.map(shift => {

      // We need to work out how long the shift is in minutes and then work that out as a % of the number of minutes in a day.
      // Then this becomes the width of the element as a % of the parent width.
      shift.length = this.getShiftLengthAsPercentageOf24Hours(shift.endTime.getTime(), shift.startTime.getTime());


      // Now we need to work out how far to the right we need to shift the div. This is the difference between midnight and the start
      // time of the shift as a % of 24 hours.


      shift.left = (((shift.startTime.getTime() - shift.startTime.setHours(0,0,0,0) - 6000) / 1000) / (24 * 60 * 60) * 100);

      return shift;

    }

    )));

  }

  // A function that determines the length of the shift in minutes and resturns that as a % of 24 hours
  getShiftLengthAsPercentageOf24Hours(endTime: number, startTime: number) : number {

    const shiftLengthInSeconds = Math.round((endTime - startTime) / 1000);

    return shiftLengthInSeconds / (24 * 60 * 60) * 100;

  }

  addStaffAssignment(vehicleId: number){

    console.log(vehicleId);

  }


}
