import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, FormArray, FormGroup, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { generateRangeOfHours, generateRangeOfQuarterHours, getCurrentDateString, getShiftLeftStartingPosition, getShiftLengthAsPercentageOf24Hours } from './../../../../core/helpers/utils';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';

interface DialogData {
  rotaDayDate: Date;
  department: string;
  assignments: AbstractControl[]
}

interface ChartData {
  value: number;
}

@Component({
  selector: 'app-area-staff-coverage',
  templateUrl: './area-staff-coverage.component.html',
  styleUrls: ['./area-staff-coverage.component.scss']
})

export class AreaStaffCoverageComponent implements OnInit {

  assignmentForm = this.fb.group({
    assignments: this.fb.array([])
  });

  errorMatcher = new CrossFieldErrorMatcher();

  breakHoursAfterStart = 4;
  breakLength = 1;

  hours = generateRangeOfHours(0,23);
  quarterHours = generateRangeOfQuarterHours(0,23);

  today = getCurrentDateString();

  /** START chart variables */

  verticalBarOptions = {
    showXAxis: true,
    showYAxis: false,
    gradient: false,
    showLegend: false,
    showGridLines: true,
    barPadding: 0,
    showXAxisLabel: true,
    xAxisLabel: "Hour",
    showYAxisLabel: false,
    yAxisLabel: "Coverage"
  };

  // colorScheme = {
  //   domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  // };



  view:[number,number] = [599,300];

  coverageByHour: ChartData[] = [];

  /** END */

  get getAssignments() : FormArray {
    return this.assignmentForm.get('assignments') as FormArray
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: UntypedFormBuilder,
    private MatDialogRef: MatDialogRef<AreaStaffCoverageComponent>
  ) { }

  ngOnInit() {

    for(let assignment of this.data.assignments){

      const assignmentGroup = <FormGroup>assignment;

      assignmentGroup.addControl('showEdit', new FormControl<boolean | null>(false));

      this.getAssignments.push(assignmentGroup);

    }

    console.log(this.data);
  }

  barSelected(val: any) : void {
    console.log(val);
  }

 /** START - Functions for getting the 'start', 'break start', 'break end', and 'end' of a shift. */

 getRealShiftStartTime(element: AbstractControl<any, any>) : string {

  return element.get('actualShiftStartTime')?.value || element.get('plannedShiftStartTime')?.value;

 }

 getRealBreakStartTime(element: AbstractControl<any, any>) : string {

  return element.get('actualBreakStartTime')?.value || element.get('plannedBreakStartTime')?.value;

 }

 getRealBreakEndTime(element: AbstractControl<any, any>) : string {

  return element.get('actualBreakEndTime')?.value || element.get('plannedBreakEndTime')?.value;

 }

 getRealShiftEndTime(element: AbstractControl<any, any>) : string {

  return element.get('actualShiftEndTime')?.value || element.get('plannedShiftEndTime')?.value;

 }

  getShiftStart(element: AbstractControl<any, any>) : number {

    const startTime = this.getRealShiftStartTime(element);

    return new Date(`${this.today} ${startTime}`).getTime();

  }

  getBreakStartTime(element: AbstractControl<any, any>, hoursToAdd: number) : number {

    const breakStartTime = this.getRealBreakStartTime(element);

    const breakTime = new Date(`${this.today} ${breakStartTime}`).getTime();

    return breakTime ? breakTime : this.getShiftStart(element) + (hoursToAdd * 60 * 60 * 1000);

  }

  getBreakEndTime(element: AbstractControl<any, any>, hoursToAdd: number) : number {

    const breakEndTime = this.getRealBreakEndTime(element);

    const breakTime = new Date(`${this.today} ${breakEndTime}`).getTime();

    return breakTime ? breakTime : this.getBreakStartTime(element, this.breakHoursAfterStart) + (hoursToAdd * 60 * 60 * 1000);

  }

  getShiftEnd(element: AbstractControl<any, any>) : number {

    const endTime = this.getRealShiftEndTime(element);

    return new Date(`${this.today} ${endTime}`).getTime();

  }

  /** END */


  /** START - These functions return the width of the 'start' section of the shift, the 'break' section, and the 'end' section of the shift */
  generateShiftStart(element: AbstractControl<any, any>) : number {

    const shiftStart = this.getShiftStart(element);

    const shiftBreakStartTime = this.getBreakStartTime(element, this.breakHoursAfterStart);

    return getShiftLengthAsPercentageOf24Hours(shiftBreakStartTime, shiftStart, this.hours);

  }

  generateBreak(element: AbstractControl<any, any>) : number {

    const shiftBreakStartTime = this.getBreakStartTime(element, this.breakHoursAfterStart);

    const shiftBreakEndTime = this.getBreakEndTime(element, this.breakLength);

    return getShiftLengthAsPercentageOf24Hours(shiftBreakEndTime, shiftBreakStartTime, this.hours);

  }

  generateShiftEnd(element: AbstractControl<any, any>) : number {

    const shiftEnd = this.getShiftEnd(element);

    const shiftBreakEndTime = this.getBreakEndTime(element, this.breakLength);

    return getShiftLengthAsPercentageOf24Hours(shiftEnd, shiftBreakEndTime, this.hours);

  }

  generateShiftLeft(element: AbstractControl<any, any>) : number {

    return getShiftLeftStartingPosition(this.getShiftStart(element), this.hours);
  }

  /** END */

  /** START - functions that get the timings for the start, break, and end of the shift */

  generateShiftTiming(element: AbstractControl<any, any>) : string {

    return `${this.getRealShiftStartTime(element)} - ${this.getRealShiftEndTime(element)}`;

  }

  generateShiftStartTiming(element: AbstractControl<any, any>) : string {

    return `${this.getRealShiftStartTime(element)} - ${this.getRealBreakStartTime(element)}`;

  }

  generateBreakTiming(element: AbstractControl<any, any>) : string {

    return `${this.getRealBreakStartTime(element)} - ${this.getRealBreakEndTime(element)}`;

  }

  generateShiftEndTiming(element: AbstractControl<any, any>) : string {

    return `${this.getRealBreakEndTime(element)} - ${this.getRealShiftEndTime(element)}`;

  }

  /** END */

  toggleEdit(element: AbstractControl<any, any>) : void {

    const currentValue = element.get('showEdit')?.value;

    element.get('showEdit')?.setValue(!currentValue);

  }

  generateCoverageByHour() : void {

    this.coverageByHour = this.quarterHours.map((hour, index) => {

      let value = 0

      this.getAssignments.controls.forEach(assignment => {

        const currentQuarterHour = new Date(`${this.today} ${hour}`).getTime();

        const shiftStart = this.getShiftStart(assignment);
        const shiftBreakStartTime = this.getBreakStartTime(assignment, this.breakHoursAfterStart);

        const shiftBreakEndTime = this.getBreakEndTime(assignment, this.breakLength)
        const shiftEnd = this.getShiftEnd(assignment);

        if(
            (currentQuarterHour >= shiftStart && currentQuarterHour < shiftBreakStartTime) || 
            (currentQuarterHour >= shiftBreakEndTime && currentQuarterHour < shiftEnd)) {

              value++;
        }
        



      })

      return {
        value
      }

    });

  }

}
