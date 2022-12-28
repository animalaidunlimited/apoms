import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild, OnDestroy } from '@angular/core';
import { FormArray, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { UserDetails } from 'src/app/core/models/user';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { DailyRotaService } from './../../services/daily-rota.service';
import { UserDetailsService } from 'src/app/core/services/user-details/user-details.service';
import { MatDialog } from '@angular/material/dialog';
import { AreaStaffCoverageComponent } from './../area-staff-coverage/area-staff-coverage.component';
import { RotationRole } from 'src/app/core/models/rota';
import { RotaSettingsService } from '../../pages/settings/services/rota-settings.service';
import { generateUUID } from 'src/app/core/helpers/utils';

interface UserUtilisation{
  userId: number;
  userCode: string;
  hours: Date;
  utilisation: "under" | "over"
}

interface AreaCount{
  area: string;
  count: number;
}

@Component({
  selector: 'app-daily-rota-day',
  templateUrl: './daily-rota-day.component.html',
  styleUrls: ['./daily-rota-day.component.scss']
})
export class DailyRotaDayComponent implements OnInit, OnDestroy {

  @Input() inputRotaDayAssignments!: unknown;
  @Input() rotaDayDate!: string;
  @Input() rotationPeriodId!: number;

  @ViewChild('userSearchInput') userSearchInput!: ElementRef; //Using this because I want the filter to appear within the table, not outside, so couldn't use a form field.

  ngUnsubscribe = new Subject();
  
  assignedUsers = new BehaviorSubject<number[]>([]); 

  dataSource: BehaviorSubject<AbstractControl[]> = new BehaviorSubject<AbstractControl[]>([this.fb.group({})]);


  // "plannedStartTime", "plannedEndTime", "actualStartTime", "actualEndTime",
  // "plannedBreakStartTime", "plannedBreakEndTime", "actualBreakStartTime", "actualBreakEndTime",
  displayedColumns = ["rotationArea", "rotationRole", "userId", "notes"];
  
  errorMatcher = new CrossFieldErrorMatcher();

  filteredUsers!: Observable<UserDetails[]> | undefined;

  filteredRotaDayAssignments!: AbstractControl[];

  rotaDayAssignments!: AbstractControl[];

  rotaDayForm = this.fb.group({    
    rotaDayAssignments: this.fb.array([])
  });

  rotationRoles$!:Observable<RotationRole[]>;

  showEmptyShifts = false;
  showUserFilter = false;

  unassignedStaff = new BehaviorSubject<UserDetails[]>([]);

  userList!: BehaviorSubject<UserDetails[]>;

  userSearch = "";

  utilisation = new BehaviorSubject<UserUtilisation[]>([]);

  public get getAssignments() : FormArray {
    return this.rotaDayForm.get('rotaDayAssignments') as FormArray;
  }

  constructor(
    private dailyRotaService: DailyRotaService,
    private userDetailsService: UserDetailsService,
    private snackbar: SnackbarService,
    private rotaSettingsService: RotaSettingsService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {

    this.rotationRoles$ = this.rotaSettingsService.getRotationRoles(false);

  }

  ngOnInit() {

    this.userList = this.userDetailsService.getUserList();
      
    this.initialiseForm();
    this.checkUnassignedStaff();
    this.watchUnassignedStaff();

  }

  ngOnChanges(changes: SimpleChanges) : void {

    this.initialiseForm();

  }

  ngOnDestroy() : void {
    this.ngUnsubscribe.next;
  }

  private initialiseForm() {
    
    this.rotaDayAssignments = (this.inputRotaDayAssignments as FormArray)?.controls;

    this.rotaDayAssignments.sort((a,b) => a.get('rotationAreaId')?.value === b.get('rotationAreaId')?.value ?
                                            b.get('areaRowSpan')?.value - a.get('areaRowSpan')?.value  :
                                            a.get('rotationAreaId')?.value - b.get('rotationAreaId')?.value
    )

    this.resetRotaDayAssignments();    

    this.rotaDayForm?.setControl('rotaDayAssignments', <FormArray>this.inputRotaDayAssignments);
    this.rotaDayForm.markAsPristine();
    
  }

  private resetRotaDayAssignments() {

    this.filteredRotaDayAssignments = this.rotaDayAssignments.map(assignment => assignment);

    this.filteredRotaDayAssignments = this.reassignAreaRowSpans(this.filteredRotaDayAssignments);

    this.dataSource.next(this.filteredRotaDayAssignments);
  }

showAreaStaffCoverage( department: string, rotationAreaId: number) : void {

  const assignments = this.getAssignments.controls.filter(assignment => assignment.get('rotationAreaId')?.value === rotationAreaId);

  this.dialog.open(AreaStaffCoverageComponent, {
    height: '98vh',
    autoFocus: false,
    data: {
      rotaDayDate: this.rotaDayDate,
      department,
      assignments
    }
  });


}

updateSelectedUsers() : void {

  const currentUsers =  this.getAssignments?.controls.map(element => Number(element.get('userId')?.value || element.get('rotationUserId')?.value));

  this.assignedUsers.next(currentUsers);

}

 generateDateFromTime(inputTime: string) : Date {

  const timeArray = inputTime.split(":");

  let returnDate = new Date();
  returnDate.setHours(Number(timeArray[0]), Number(timeArray[1]), Number(timeArray[2] || "00"));

  return returnDate;

 }

 saveRotaDay() : void {

  //Let's find all of the users that have an actual start and end time. Then let's find out who is under or over utilised
  this.updateUtilisation();
  
  for(let assignment of this.getAssignments.controls){

    if(!assignment.pristine){
      this.dailyRotaService.saveAssignment(this.rotaDayDate, this.rotationPeriodId, assignment.value).then(response => {

        if(response.success === 1){
          this.snackbar.successSnackBar("Areas saved to preferences","OK");
          this.rotaDayForm.markAsPristine();
          this.rotaDayForm.markAsUntouched();

        }
        else {
          this.snackbar.errorSnackBar("Save failed - error: DRC-236","OK");
        }

      })
    }

  }

}

  private updateUtilisation() {
    let utilisation = this.getAssignments.controls.filter(assignment => assignment.get('actualShiftStartTime')?.value || assignment.get('actualShiftEndTime')?.value)
      .reduce((result, current) => {

        if (result.find(element => element.userId === current.get('userId')?.value)) {
          console.log(current.get('actualShiftStartTime')?.value);
          console.log(current.get('actualShiftEndTime')?.value);
        }
        else {
          let start = this.generateDateFromTime(current.get('actualShiftStartTime')?.value);
          let end = this.generateDateFromTime(current.get('actualShiftEndTime')?.value);

          let utilisedHours = new Date();
          utilisedHours.setHours(0, 0, 0);

          utilisedHours.setMilliseconds((end.getTime() - start.getTime()));

          result.push({
            userId: current.get('userId')?.value,
            userCode: this.userDetailsService.getUserCode(current.get('userId')?.value),
            hours: utilisedHours,
            utilisation: utilisedHours.getHours() < 9 ? "under" : "over"
          });

        }


        return result;

      }, [] as UserUtilisation[]);

    this.utilisation.next(utilisation);
  }

watchUnassignedStaff() : void {    

  this.getAssignments.valueChanges.subscribe(() => {

    this.checkUnassignedStaff();

  });
    
}

private checkUnassignedStaff() {

  const unassigned = this.userList.value.filter(user => !(this.getAssignments.controls.some(element => element.get('userId')?.value === user.userId)));

  this.unassignedStaff.next(unassigned);

}

checkActualTimes(assignment: AbstractControl, element: HTMLInputElement, formField:string, matchingFormField: string) : void {

  assignment.get(formField)?.clearValidators();
  assignment.get(formField)?.setErrors(null);

  //We're using the validity check to hack around the fact that a time input sees an invalid value (like if you just entered the hours and no minutes)
  //as a blank value and sets the input value to null.
  if(assignment.get(formField)?.value || assignment.get(matchingFormField)?.value || !element.checkValidity()){
    assignment.get(formField)?.setValidators([Validators.required, Validators.pattern(/[\S]/)]);
    assignment.get(matchingFormField)?.setValidators([Validators.required, Validators.pattern(/[\S]/)]);
  }

  assignment.get(formField)?.updateValueAndValidity();
  assignment.get(matchingFormField)?.updateValueAndValidity();

}

showEmptyShiftsOnly() : void {

  if(this.userSearch !== ''){
    return;
  }

  this.showEmptyShifts = !this.showEmptyShifts;

  this.filteredRotaDayAssignments = this.showEmptyShifts ?  this.rotaDayAssignments.filter(assignment => !assignment.get('userId')?.value) :
                                                            this.rotaDayAssignments;

  this.filteredRotaDayAssignments = this.reassignAreaRowSpans(this.filteredRotaDayAssignments)

  this.dataSource.next(this.filteredRotaDayAssignments);

}

searchUsers(event: any) : void {
  this.userSearch = (event.target as HTMLInputElement).value;

  const foundUsers = this.userList.value.filter(element => element.firstName.toLowerCase()
                                                                      .includes(this.userSearch.toLowerCase()))
                                                                      .map(element => element.userId);

  this.filteredRotaDayAssignments = this.rotaDayAssignments.filter(assignment => foundUsers.includes(assignment.get('userId')?.value));

  this.filteredRotaDayAssignments = this.reassignAreaRowSpans(this.filteredRotaDayAssignments)

  this.dataSource.next(this.filteredRotaDayAssignments);
}

reassignAreaRowSpans(assignments: AbstractControl[]) : AbstractControl[] {

  let areaCounts = assignments.reduce((result, current) => {

    let foundArea = result.find(area => area.area === current.get('rotationArea')?.value)

    if(foundArea){

      foundArea.count++;

    }
    else {
      result.push({
        area: current.get('rotationArea')?.value,
        count: 1
      })
    }

    return result;

  }, [] as AreaCount[]);

  assignments = assignments.map((element, index) => {

    if(index === 0){

      const foundAreaCount = areaCounts.find(area => area.area === element.get('rotationArea')?.value);

      element.get('areaRowSpan')?.setValue(foundAreaCount?.count);
    }
    else if(assignments[index - 1].get('rotationArea')?.value === element.get('rotationArea')?.value){
      element.get('areaRowSpan')?.setValue(0);
    }
    else {
      const foundAreaCount = areaCounts.find(area => area.area === element.get('rotationArea')?.value);

      element.get('areaRowSpan')?.setValue(foundAreaCount?.count);
    }

    return element;
  });

  return assignments;

}

clearAndCloseUserSearch() : void {

  this.userSearch = ''
  this.resetRotaDayAssignments();

}

toggleUserFilter() : void {
  this.showUserFilter = !this.showUserFilter;

  if(this.showUserFilter){
    //Let's wait a tick for change detection to run and the element to be added to the DOM.
    setTimeout(() => this.userSearchInput.nativeElement.value = this.userSearch, 1);
  }

}

addShift() : void {

  const emptyAssignment = this.dailyRotaService.emptyAssignment();

  //Let's generate an ID we can use to remove newly added assignments
  emptyAssignment.get('guid')?.setValue(generateUUID());

  this.filteredRotaDayAssignments.push(emptyAssignment);
  this.getAssignments.push(emptyAssignment);

  this.dataSource.next(this.filteredRotaDayAssignments);

}

deleteShift(shift: AbstractControl) : void {

  this.filteredRotaDayAssignments = this.filteredRotaDayAssignments.filter(element => element.get('guid')?.value !== shift.get('guid')?.value);

  let foundIndex = this.getAssignments.controls.findIndex(element => element.get('guid')?.value !== shift.get('guid')?.value);
  this.getAssignments.removeAt(foundIndex);

  this.dataSource.next(this.filteredRotaDayAssignments);
}

roleSelected(role: RotationRole, shift: AbstractControl) : void {

  shift.patchValue(role);

  // shift.get('plannedShiftStartTime')?.setValue(role.startTime);
  // shift.get('plannedShiftEndTime')?.setValue(role.endTime);
  // shift.get('plannedBreakStartTime')?.setValue(role.breakStartTime);
  // shift.get('plannedBreakEndTime')?.setValue(role.breakEndTime);
  
}

}


