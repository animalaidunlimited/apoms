import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { VehicleShift } from 'src/app/core/models/vehicle';
import { VehicleService } from '../services/vehicle.service';

@Injectable({ providedIn: 'root' })
export class ShiftTimeValidator {
    constructor(
        private vehicleService: VehicleService
    ) {}

    //validate(time: string, shifts: VehicleShift[]): ValidatorFn {
    validate(dateType: string, iMatchDate:AbstractControl|null, vehicleId: number): ValidatorFn {

        return (
            control: AbstractControl,
        ): ValidationErrors => {

            let errors:ValidationErrors = {};

            let currentTime = new Date(control.value);

            let matchDate = iMatchDate?.value ? new Date(iMatchDate.value) : new Date(control.value);

            let shifts = this.vehicleService.vehicleShifts.value.filter(shift => shift.vehicleId === vehicleId);

            // If the form hasn't been touched then don't validate
            if (control.pristine) {
                null;
            }

            // Check if the time falls inside any existing shifts
            if(this.timeIsInsideOtherShift(currentTime, shifts)){
                errors["inside-other-shift"] = true;
            }


            // If the time is the start time, then check that it's before the end time
            if(dateType === 'start' && currentTime > matchDate){
                errors["start-before-end"] = true;
            }


            // If the time is an end time, check that it's after the start time.
            if(dateType === 'end' && currentTime < matchDate){
                errors["end-before-start"] = true;
            }


            // If the this time has an existing match, check that the new shift doesn't overlap any other shifts.
            let start = dateType === 'start' ? currentTime : matchDate;
            let end = dateType === 'end' ? currentTime : matchDate;

            if(this.shiftOverlapsExistingShift(start, end, shifts)){
                errors["shift-overlap"] = true;
            }



            return errors;
        };
    }

    timeIsInsideOtherShift(currentTime: Date, shifts: VehicleShift[]) : boolean{

        return shifts.some(shift => currentTime >= shift.shiftStartTime && currentTime <= shift.shiftEndTime);
    }

    shiftOverlapsExistingShift(startDate: Date, endDate: Date, shifts: VehicleShift[]) : boolean {

        return shifts.some(shift => endDate >= shift.shiftStartTime && startDate <= shift.shiftEndTime);
    }
}
