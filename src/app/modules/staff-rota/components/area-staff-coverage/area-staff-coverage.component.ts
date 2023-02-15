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

      this.data.assignments.sort((a,b) => {
        
        // return this.getMillisecondsFromStartTime(a) === this.getMillisecondsFromStartTime(b) ?
        // a.get('employeeNumber')?.value - b.get('employeeNumber')?.value : -1;

        if(this.getMillisecondsFromStartTime(a) === this.getMillisecondsFromStartTime(b)){

          console.log(a.get('employeeNumber')?.value)

          return a.get('employeeNumber')?.value - b.get('employeeNumber')?.value;
        }

        return this.getMillisecondsFromStartTime(a) - this.getMillisecondsFromStartTime(b);
      
      });

      const assignmentGroup = <FormGroup>assignment;

      assignmentGroup.addControl('showEdit', new FormControl<boolean | null>(false));

      this.getAssignments.push(assignmentGroup);

    }

    console.log(this.data);
  }

  barSelected(val: any) : void {
    console.log(val);
  }

  /** START - Functions for getting the 'start' and 'end' of a shift. */

  getRealShiftStartTime(element: AbstractControl<any, any>) : string {

    return element.get('actualStartTime')?.value || element.get('plannedStartTime')?.value;

  }

  getRealShiftEndTime(element: AbstractControl<any, any>) : string {

    return element.get('actualEndTime')?.value || element.get('plannedEndTime')?.value;

  }

  getMillisecondsFromStartTime(element: AbstractControl<any, any>){

    const time = this.getRealShiftStartTime(element);

    return new Date(`${this.today} ${time}`).getTime();

  }

  getShiftStart(element: AbstractControl<any, any>) : number {

    const startTime = this.getRealShiftStartTime(element);

    return new Date(`${this.today} ${startTime}`).getTime();

  }

  getShiftEnd(element: AbstractControl<any, any>) : number {

    const endTime = this.getRealShiftEndTime(element);

    return new Date(`${this.today} ${endTime}`).getTime();

  }

  /** END */


  /** START - These functions return the width of the 'start' section of the shift, the 'break' section, and the 'end' section of the shift */
  generateShift(element: AbstractControl<any, any>) : number {

    const shiftStart = this.getShiftStart(element);

    const shiftEndTime = this.getShiftEnd(element);

    return getShiftLengthAsPercentageOf24Hours(shiftEndTime, shiftStart, this.hours);

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

    return `${this.getRealShiftStartTime(element)} - ${this.getRealShiftEndTime(element)}`;

  }

  generateShiftEndTiming(element: AbstractControl<any, any>) : string {

    return `${this.getRealShiftStartTime(element)} - ${this.getRealShiftEndTime(element)}`;

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
        const shiftEnd = this.getShiftEnd(assignment);

        if(
            (currentQuarterHour >= shiftStart && currentQuarterHour < shiftEnd) || 
            (currentQuarterHour >= shiftEnd && currentQuarterHour < shiftEnd)) {

              value++;
        }
        



      })

      return {
        value
      }

    });

  }

}
