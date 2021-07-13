import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UniqueValidators } from 'src/app/core/validators/unique-validators';
import { getCurrentDateString } from 'src/app/core/helpers/utils';
import { Vehicle } from 'src/app/core/models/driver-view';
import { User } from 'src/app/core/models/user';
import { VehicleShift } from 'src/app/core/models/vehicle';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { VehicleService } from '../../services/vehicle.service';
import { ShiftTimeValidator } from '../../validators/shift-time.validator';



@Component({
  selector: 'app-vehicle-shift',
  templateUrl: './vehicle-shift.component.html',
  styleUrls: ['./vehicle-shift.component.scss']
})
export class VehicleShiftComponent implements OnInit {

  @Input() vehicle!: Vehicle;
  @Input() shiftDate!: Date;

  addShiftFormGroup = this.fb.group({});

  currentDayStart!:Date;
  currentDayEnd!:Date;

  errorMatcher = new CrossFieldErrorMatcher();

  existingStaff: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);

  hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];

  staff$!: Observable<User[]>;

  shifts$!: Observable<VehicleShift[]>;

  showAddShiftDialog = false;

  shiftStartTime: AbstractControl | null = null;
  shiftEndTime: AbstractControl | null = null;

  minDate = getCurrentDateString() + "T00:00";
  minEndTime = getCurrentDateString() + "T00:00";
  maxDate = getCurrentDateString() + "T23:59:59";
  maxStartTime = getCurrentDateString() + "T23:59:59";

  staffArray = this.fb.array([]);

  constructor(
    private vehicleService: VehicleService,
    private dropdowns: DropdownService,
    private shiftValidator: ShiftTimeValidator,
    private fb: FormBuilder
  ) {
   }

  ngOnInit(): void {

    console.log(this.shiftDate)

    this.currentDayStart = new Date(this.shiftDate);
    this.currentDayStart.setHours(0,0,0);

    this.currentDayEnd = new Date(this.shiftDate);
    this.currentDayEnd.setHours(23,59,59,999);



    this.staff$ = this.dropdowns.getRescuers();

    this.shifts$ = this.vehicleService.vehicleShifts.pipe(map(shifts => shifts
      .filter(shift => shift.vehicleId === this.vehicle.vehicleId)
      .map(shift => {

      // We need to work out how long the shift is in minutes and then work that out as a % of the number of minutes in a day.
      // Then this becomes the width of the element as a % of the parent width.
      shift.length = this.getShiftLengthAsPercentageOf24Hours(shift.shiftEndTime.getTime(), shift.shiftStartTime.getTime());

      // Now we need to work out how far to the right we need to shift the div. This is the difference between midnight and the start
      // time of the shift as a % of 24 hours.
      let midnight = new Date(shift.shiftStartTime.getTime());

      shift.left = (((shift.shiftStartTime.getTime() - midnight.setHours(0,0,0,0) - 6000) / 1000) / (24 * 60 * 60) * 100);

      return shift;

    }

    )));

  }

  // A function that determines the length of the shift in minutes and resturns that as a % of 24 hours
  getShiftLengthAsPercentageOf24Hours(endTime: number, startTime: number) : number {

    const shiftLengthInSeconds = Math.round((endTime - startTime) / 1000);

    return shiftLengthInSeconds / (24 * 60 * 60) * 100;

  }

  addStaffAssignment(){

    this.showAddShiftDialog = !this.showAddShiftDialog;

    this.addShiftFormGroup = this.generateAddShiftForm();

    this.shiftStartTime = this.addShiftFormGroup.get('shiftStartTime');
    this.shiftEndTime = this.addShiftFormGroup.get('shiftEndTime');

    // Do something to try and limit the times. Note this doesn't work for minutes or seconds. So we
    // also need to handle it in the validators
    this.shiftStartTime?.valueChanges.subscribe(startChanged => this.minEndTime = startChanged );

    this.shiftEndTime?.valueChanges.subscribe(endChanged => this.maxStartTime = endChanged);

    this.staffArray = this.addShiftFormGroup.get('vehicleStaff') as FormArray;

    this.existingStaff.next([]);

  }

  generateAddShiftForm() : FormGroup {

    const staffArray = this.fb.array([]);

    for(let i = 0; i < this.vehicle.maxRescuerCapacity; i++){

      // As we add staff into the array, check that this one is less than the minimum number
      // of staff required for the vehicle.
      const staff = this.fb.group({
        userId: [, i <= this.vehicle.minRescuerCapacity ? Validators.required : null]
      });

      staffArray.setValidators(UniqueValidators.uniqueBy('userId'));

      staffArray.push(staff);

    }

     const returnGroup = this.fb.group({
      vehicleShiftId: [],
      vehicleId: [this.vehicle.vehicleId, Validators.required],
      shiftStartTime: [],
      shiftEndTime: [],
      vehicleStaff: staffArray
    });

    returnGroup.get('shiftStartTime')?.setValidators([Validators.required, this.shiftValidator.validate('start', returnGroup.get('shiftEndTime'), this.vehicle.vehicleId)]);
    returnGroup.get('shiftEndTime')?.setValidators([Validators.required, this.shiftValidator.validate('end', returnGroup.get('shiftStartTime'), this.vehicle.vehicleId)]);


    return returnGroup;

  }

  addStaffShift() : void {

    this.vehicleService.addVehicleShift(this.vehicle.vehicleId, this.addShiftFormGroup)

  }


}
