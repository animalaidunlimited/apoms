import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vehicle } from 'src/app/core/models/driver-view';
import { User } from 'src/app/core/models/user';
import { VehicleShift } from 'src/app/core/models/vehicle';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { VehicleService } from '../../services/vehicle.service';



@Component({
  selector: 'app-vehicle-shift',
  templateUrl: './vehicle-shift.component.html',
  styleUrls: ['./vehicle-shift.component.scss']
})
export class VehicleShiftComponent implements OnInit {

  @Input() vehicle!: Vehicle;
  @Input() shiftDate!: Date;

  addShiftFormGroup = this.fb.group({});

  errorMatcher = new CrossFieldErrorMatcher();

  hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];

  staff$!: Observable<User[]>;



  shifts$!: Observable<VehicleShift[]>;


  showAddShiftDialog = false;

  staffArray = this.fb.array([]);

  constructor(
    private vehicleService: VehicleService,
    private dropdowns: DropdownService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {

    this.staff$ = this.dropdowns.getRescuers();

    this.shifts$ = this.vehicleService.vehicleShifts.pipe(map(shifts => shifts
      .filter(shift => shift.vehicleId === this.vehicle.vehicleId)
      .map(shift => {

      // We need to work out how long the shift is in minutes and then work that out as a % of the number of minutes in a day.
      // Then this becomes the width of the element as a % of the parent width.
      shift.length = this.getShiftLengthAsPercentageOf24Hours(shift.endTime.getTime(), shift.startTime.getTime());

      // Now we need to work out how far to the right we need to shift the div. This is the difference between midnight and the start
      // time of the shift as a % of 24 hours.
      let midnight = new Date(shift.startTime.getTime());

      shift.left = (((shift.startTime.getTime() - midnight.setHours(0,0,0,0) - 6000) / 1000) / (24 * 60 * 60) * 100);

      return shift;

    }

    )));

    console.log(this.vehicle.vehicleId);
    this.vehicleService.vehicleShifts.subscribe(val => console.log(val));

  }

  // A function that determines the length of the shift in minutes and resturns that as a % of 24 hours
  getShiftLengthAsPercentageOf24Hours(endTime: number, startTime: number) : number {

    const shiftLengthInSeconds = Math.round((endTime - startTime) / 1000);

    return shiftLengthInSeconds / (24 * 60 * 60) * 100;

  }

  addStaffAssignment(){

    this.showAddShiftDialog = !this.showAddShiftDialog;

    this.addShiftFormGroup = this.generateAddShiftForm();

    this.staffArray = this.addShiftFormGroup.get('vehicleStaff') as FormArray;

  }

  generateAddShiftForm() : FormGroup {

    const staffArray = this.fb.array([]);

    for(let i = 0; i < this.vehicle.maxRescuerCapacity; i++){

      // As we add staff into the array, check that this one is less than the minimum number
      // of staff required for the vehicle.
      const staff = this.fb.group({
        userId: [, i <= this.vehicle.minRescuerCapacity ? Validators.required : null]
      });

      staffArray.push(staff);

    }

    return this.fb.group({
      vehicleShiftId: [],
      vehicleId: [this.vehicle.vehicleId, Validators.required],
      shiftStartTimeString: [, Validators.required],
      shiftEndTimeString: [, Validators.required],
      vehicleStaff: staffArray
    });

  }

  addStaffShift() : void {

    this.vehicleService.addVehicleShift(this.shiftDate, this.vehicle.vehicleId, this.addShiftFormGroup)

  }


}
