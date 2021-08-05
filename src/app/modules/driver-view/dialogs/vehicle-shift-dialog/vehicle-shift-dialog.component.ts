import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { generateUUID, getCurrentDateString, getCurrentTimeString } from 'src/app/core/helpers/utils';
import { Vehicle } from 'src/app/core/models/driver-view';
import { User } from 'src/app/core/models/user';
import { VehicleShift } from 'src/app/core/models/vehicle';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { UniqueValidators } from 'src/app/core/validators/unique-validators';
import { VehicleService } from '../../services/vehicle.service';
import { ShiftTimeValidator } from '../../validators/shift-time.validator';

interface IncomingVehicleDetails {
  vehicle: Vehicle;
  shift?: VehicleShift;
  currentDate: string;
}

@Component({
  selector: 'app-vehicle-shift-dialog',
  templateUrl: './vehicle-shift-dialog.component.html',
  styleUrls: ['./vehicle-shift-dialog.component.scss']
})
export class VehicleShiftDialogComponent implements OnInit {

  addShiftFormGroup = this.fb.group({});

  errorMatcher = new CrossFieldErrorMatcher();

  existingStaff: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);


  minDate = this.data.currentDate + "T07:00";
  minEndTime = this.data.currentDate + "T07:00";
  maxDate = this.data.currentDate + "T23:59:59";
  maxStartTime = this.data.currentDate + "T23:59:59";

  staff$!: Observable<User[]>;
  staffArray = this.fb.array([]);

  shiftStartTime: AbstractControl | null = null;
  shiftEndTime: AbstractControl | null = null;

  isEdit = false;

  constructor(
    private vehicleService: VehicleService,
    private dropdowns: DropdownService,
    private fb: FormBuilder,
    private datepipe: DatePipe,
    private shiftValidator: ShiftTimeValidator,
    public dialogRef: MatDialogRef<VehicleShiftDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IncomingVehicleDetails
  ) { }

  ngOnInit(): void {

    this.staff$ = this.dropdowns.getRescuers();

    this.isEdit = this.data.shift ? true : false;

    this.addStaffAssignment();

    this.updateValidators();

  }

  private updateValidators() {
    this.addShiftFormGroup.get('shiftStartTime')?.clearValidators();

    this.addShiftFormGroup.get('shiftStartTime')?.setValidators([
      Validators.required,
      this.shiftValidator.validate('start',
        this.addShiftFormGroup.get('shiftEndTime'),
        this.addShiftFormGroup.get('shiftUUID')?.value,
        this.data.vehicle?.vehicleId)
    ]);


    this.addShiftFormGroup.get('shiftEndTime')?.clearValidators();

    this.addShiftFormGroup.get('shiftEndTime')?.setValidators([
      Validators.required,
      this.shiftValidator.validate('end',
        this.addShiftFormGroup.get('shiftStartTime'),
        this.addShiftFormGroup.get('shiftUUID')?.value,
        this.data.vehicle?.vehicleId)
    ]);

  }

  addStaffAssignment(){

    this.addShiftFormGroup = this.generateAddShiftForm();

    this.shiftStartTime = this.addShiftFormGroup.get('shiftStartTime');
    this.shiftEndTime = this.addShiftFormGroup.get('shiftEndTime');

    // Do something to try and limit the times. Note this doesn't work for minutes or seconds. So we
    // also need to handle it in the validators
    this.shiftStartTime?.valueChanges.subscribe((startChanged:string) => this.minEndTime = startChanged || this.data.currentDate + "T00:00" );

    this.shiftEndTime?.valueChanges.subscribe((endChanged:string) => this.maxStartTime = endChanged || this.data.currentDate + "T23:59:59");

    this.staffArray = this.addShiftFormGroup.get('vehicleStaff') as FormArray;

    // If we're editing a shift then patch it here.
    if(this.data.shift){

      let shift = JSON.parse(JSON.stringify(this.data.shift));

      shift.shiftStartTime = this.datepipe.transform( new Date(this.data.shift.shiftStartTime) , 'yyyy-MM-ddTHH:mm');
      shift.shiftEndTime = this.datepipe.transform( new Date(this.data.shift.shiftEndTime) , 'yyyy-MM-ddTHH:mm');

      this.addShiftFormGroup.patchValue(shift);
    }

    this.existingStaff.next([]);

  }

  generateAddShiftForm() : FormGroup {

    const staffArray = this.fb.array([]);

    for(let i = 0; i < this.data.vehicle?.maxRescuerCapacity; i++){

      // As we add staff into the array, check that this one is less than the minimum number
      // of staff required for the vehicle.
      const staff = this.fb.group({
        userId: [, i <= this.data.vehicle?.minRescuerCapacity ? Validators.required : null]
      });

      staffArray.setValidators(UniqueValidators.uniqueBy('userId'));

      staffArray.push(staff);

    }

     const returnGroup = this.fb.group({
      shiftUUID: [],
      vehicleShiftId: [],
      vehicleId: [this.data.vehicle?.vehicleId, Validators.required],
      shiftStartTime: [],
      shiftEndTime: [],
      vehicleStaff: staffArray
    });

    return returnGroup;

  }

  upsertStaffShift() : void {

    this.vehicleService.upsertVehicleShift(this.data.vehicle?.vehicleId, this.addShiftFormGroup);

    if(!this.isEdit){
      this.resetForm();
    }

  }


  resetForm(){

    this.addShiftFormGroup.reset();
    this.addShiftFormGroup.get('vehicleId')?.setValue(this.data.vehicle?.vehicleId);
    this.addShiftFormGroup.get('shiftUUID')?.setValue(this.data.shift?.shiftUUID);

    this.updateValidators();

  }

}
