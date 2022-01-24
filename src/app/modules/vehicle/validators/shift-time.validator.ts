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
    validate(dateType: string, iMatchDate:AbstractControl|null, iUUID:string|null , vehicleId: number): ValidatorFn {

        return (
            control: AbstractControl,
        ): ValidationErrors => {

            let errors:ValidationErrors = {};

            let currentTime = new Date(control.value);

            let matchDate = iMatchDate?.value ? new Date(iMatchDate.value) : new Date(control.value);

            let shifts = this.vehicleService.vehicleShifts.value.filter(shift => shift.vehicleId === vehicleId);

            // Check if the time falls inside any existing shifts
            if(this.timeIsInsideOtherShift(currentTime, shifts, iUUID)){
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

            if(this.shiftOverlapsExistingShift(start, end, shifts, iUUID)){
                errors["shift-overlap"] = true;
            }

            return errors;
        };
    }

    timeIsInsideOtherShift(currentTime: Date, shifts: VehicleShift[], iUUID: string|null) : boolean{

        return shifts.some(shift => {

            return currentTime >= shift.shiftStartTimeDate && currentTime <= shift.shiftEndTimeDate && shift.shiftUUID !== iUUID});
    }

    shiftOverlapsExistingShift(startDate: Date, endDate: Date, shifts: VehicleShift[], iUUID: string|null) : boolean {

        return shifts.some(shift => endDate >= shift.shiftStartTimeDate && startDate <= shift.shiftEndTimeDate && shift.shiftUUID !== iUUID);
    }
}
