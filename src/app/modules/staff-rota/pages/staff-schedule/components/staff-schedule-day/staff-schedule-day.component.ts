import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild, OnDestroy } from '@angular/core';
import { FormArray, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { UserDetails } from 'src/app/core/models/user';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { StaffScheduleService } from '../../../../services/staff-schedule.service';
import { UserDetailsService } from 'src/app/core/services/user-details/user-details.service';
import { MatDialog } from '@angular/material/dialog';
import { AreaStaffCoverageComponent } from '../../../../components/area-staff-coverage/area-staff-coverage.component';
import { RotationArea, GroupedRotationAreaPosition } from 'src/app/core/models/rota';
import { RotaSettingsService } from '../../../settings/services/rota-settings.service';
import { addDaysToDate, generateDateFromTime, generateUUID } from 'src/app/core/helpers/utils';
import { ConfirmationDialog } from 'src/app/core/components/confirm-dialog/confirmation-dialog.component';
import { takeUntil } from 'rxjs/operators';


interface UserUtilisation{
  userId: number;
  employeeNumber: string;
  userCode: string;
  hours: Date;
  utilisation: "under" | "over" | "on"
}

@Component({
  selector: 'app-staff-schedule-day',
  templateUrl: './staff-schedule-day.component.html',
  styleUrls: ['./staff-schedule-day.component.scss','../../staff-schedule.component.scss']
})
export class StaffScheduleDayComponent implements OnInit, OnDestroy {

  @Input() inputRotaDayAssignments!: unknown;
  @Input() rotaDayDate!: string;
  @Input() rotationPeriodId!: number;

  @ViewChild('userSearchInput') userSearchInput!: ElementRef; //Using this because I want the filter to appear within the table, not outside, so couldn't use a form field.

  ngUnsubscribe = new Subject();
  
  assignedUsers = new BehaviorSubject<number[]>([]); 
 
  displayedColumns = ["rotationArea", "rotationAreaPosition", "userId", "plannedStartTime", "plannedEndTime", "actualStartTime", "actualEndTime", "notes"];
  
  errorMatcher = new CrossFieldErrorMatcher();

  filteredUsers!: Observable<UserDetails[]> | undefined;

  rotaDayForm = this.fb.group({    
    rotaDayAssignments: this.fb.array([])
  });

  filteredRotaDayForm = this.fb.group({    
    filteredRotaDayAssignments: this.fb.array([])
  });

  rotationAreas$:Observable<RotationArea[]>;
  rotationAreaPositions$:Observable<GroupedRotationAreaPosition[]>;  

  showEmptyShifts = false;
  showUserFilter = false;

  unassignedStaff = new BehaviorSubject<UserDetails[]>([]);

  userList!: BehaviorSubject<UserDetails[]>;

  userSearch = "";

  utilisation = new BehaviorSubject<UserUtilisation[]>([]);

  public get rotaDayAssignments() : AbstractControl[] {
    return (this.rotaDayForm.get('rotaDayAssignments') as FormArray)?.controls;
  }

  public set rotaDayAssignments(incomingValue: AbstractControl[]) {

    let assignments:FormArray = this.fb.array([]);

    for(let value of incomingValue){
      assignments.push(value);
    }

    this.rotaDayForm.setControl("rotaDayAssignments", assignments);

  }

  public get filteredRotaDayAssignments() : AbstractControl[] {
    return (this.filteredRotaDayForm.get('filteredRotaDayAssignments') as FormArray)?.controls;
  }

  public set filteredRotaDayAssignments(incomingValue: AbstractControl[]) {

    let assignments:FormArray = this.fb.array([]);

    for(let value of incomingValue){
      assignments.push(value);
    }

    this.filteredRotaDayForm.setControl("filteredRotaDayAssignments", assignments);

  }

  constructor(
    private staffScheduleService: StaffScheduleService,
    private userDetailsService: UserDetailsService,
    private snackbar: SnackbarService,
    private rotaSettingsService: RotaSettingsService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {

    this.rotationAreas$ = this.rotaSettingsService.getRotationAreas(false);
    this.rotationAreaPositions$ = this.rotaSettingsService.getGroupedRotationAreaPositions(false);

  }

  ngOnInit() {

    this.userList = this.userDetailsService.getScheduleUserList();
      
    this.initialiseForm();
    this.checkUnassignedStaff();
    this.watchUnassignedStaff();
    this.recalculateTaskCountByUser();

  }

  ngOnChanges(changes: SimpleChanges) : void {

    this.initialiseForm();

  }

  ngOnDestroy() : void {
    this.ngUnsubscribe.next;
  }

  private initialiseForm() {
    
    this.rotaDayAssignments = (this.inputRotaDayAssignments as FormArray)?.controls;    

    

    this.rotaDayAssignments.sort((a,b) => a.get('sequence')?.value - b.get('sequence')?.value);

    this.resetRotaDayAssignments();    

    this.rotaDayForm?.setControl('rotaDayAssignments', <FormArray>this.inputRotaDayAssignments);
    this.rotaDayForm.markAsPristine();
    
    this.updateUtilisation();
    
  }

  private resetRotaDayAssignments() {

    //Let's remove the tea and lunch breaks
    this.filteredRotaDayAssignments = this.rotaDayAssignments.filter(assignment => assignment.get('rotationAreaPositionId')?.value > -3 )
                                                             .map(assignment => assignment)
                                                             .sort(this.staffScheduleService.sortAssignments);

    this.filteredRotaDayAssignments = this.staffScheduleService.reassignAreaRowSpans(this.filteredRotaDayAssignments);

  }

showAreaStaffCoverage( department: string, rotationAreaId: number) : void {

  const assignments = this.rotaDayAssignments.filter(assignment => assignment.get('rotationAreaId')?.value === rotationAreaId);

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

  const currentUsers =  this.rotaDayAssignments.map(element => Number(element.get('userId')?.value || element.get('rotationUserId')?.value));

  this.assignedUsers.next(currentUsers);

}



 saveRotaDay() : void {

  //Let's find all of the users that have an actual start and end time. Then let's find out who is under or over utilised
  this.updateUtilisation();
  
  for(let assignment of this.rotaDayAssignments){

    if(!assignment.pristine){
      this.staffScheduleService.saveAssignment(this.rotaDayDate, this.rotationPeriodId, assignment.value).then(response => {

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

    let currentAssignments = this.rotaDayAssignments
    .filter(assignment => assignment.get('rotationAreaPositionId')?.value > 0)
    .reduce((returnValue, current) => {

      if(current.get('plannedRotationAreaId')?.value < 0) return returnValue;

      let foundUser = returnValue.find(element => element.userId === current.get('userId')?.value);

      let start = generateDateFromTime(current.get('actualStartTime')?.value || current.get('plannedStartTime')?.value);
      let end = generateDateFromTime(current.get('actualEndTime')?.value || current.get('plannedEndTime')?.value);

      if(current.get('nextDay')?.value){

        end = addDaysToDate(end, 1);

      }
      
      if(!foundUser){

        const utilisedHours = new Date();
        utilisedHours.setHours(0, 0, 0);
        utilisedHours.setMilliseconds((end.getTime() - start.getTime()));

        returnValue.push({
          userId: current.get('userId')?.value,
          employeeNumber: current.get('employeeNumber')?.value,
          userCode: this.userDetailsService.getUserCode(current.get('userId')?.value),
          hours: utilisedHours,
          utilisation: this.getUtilisation(utilisedHours)
        });
      }
      else {              

        foundUser.hours = new Date(foundUser.hours.getTime() + (end.getTime() - start.getTime()));
        foundUser.utilisation = this.getUtilisation(foundUser.hours);

      }

      return returnValue;

    }, [] as UserUtilisation[]);
    
    currentAssignments.sort((a,b) => (a.employeeNumber || '0').localeCompare(
      b.employeeNumber || '0',
      undefined,
      {numeric : true, sensitivity: 'base'}
    ));
 
    this.utilisation.next(currentAssignments);
  }

  private getUtilisation(utilisedHours: Date): "under" | "over" | "on" {

    if(utilisedHours.getHours() === 9){
      return "on";
    }

    return utilisedHours.getHours() < 9 ? "under" : "over";
  }

watchUnassignedStaff() : void {    

  this.rotaDayForm.get('rotaDayAssignments')?.valueChanges.subscribe(() => {

    this.checkUnassignedStaff();
    this.recalculateTaskCountByUser();

  });
    
}

private recalculateTaskCountByUser() : void {

  this.rotaDayAssignments.forEach(staffTask => {

    const shiftSegmentCount = this.rotaDayAssignments.filter(element => element.get('userId')?.value === staffTask.get('userId')?.value
                                                                              && !!element.get('userId')?.value
                                                                              && element.get('rotationAreaPositionId')?.value > 0);    

    staffTask.get('shiftSegmentCount')?.setValue(shiftSegmentCount.length, {emitEvent: false});

  });

}

private checkUnassignedStaff() {

  const unassigned = this.userList.value.filter(user => !(this.rotaDayAssignments.some(element => element.get('userId')?.value === user.userId)));

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

  this.filteredRotaDayAssignments.sort(this.staffScheduleService.sortAssignments);

  this.filteredRotaDayAssignments = this.staffScheduleService.reassignAreaRowSpans(this.filteredRotaDayAssignments); 

}

searchUsers(event: KeyboardEvent) : void {

  if(event.key === "Enter"){
    this.showUserFilter = !this.showUserFilter;
    return;
  }

  this.userSearch = (event.target as HTMLInputElement).value;

  const foundUsers = this.userList.value.filter(element =>
                                                          element.firstName.toLowerCase().includes(this.userSearch.toLowerCase())
                                                          ||
                                                          element.employeeNumber.includes(this.userSearch.toLowerCase())
                                                          )
                                                          .map(element => element.userId);

  let assignments = this.rotaDayAssignments.filter(assignment => foundUsers.includes(assignment.get('userId')?.value))
                                           .sort(this.staffScheduleService.sortAssignments);

  this.filteredRotaDayAssignments = this.staffScheduleService.reassignAreaRowSpans(assignments);

}

clearAndCloseUserSearch() : void {

  this.userSearch = ''
  this.resetRotaDayAssignments();

}

toggleUserFilter() : void {
  this.showUserFilter = !this.showUserFilter;

  if(this.showUserFilter){
    //Let's wait a tick for change detection to run and the element to be added to the DOM.
    setTimeout(() => {
      this.userSearchInput.nativeElement.value = this.userSearch;
      this.userSearchInput.nativeElement.focus();
    }, 1);
  }

}

addShift() : void {

  const emptyAssignment = this.staffScheduleService.emptyAssignment();

  //Let's generate an ID we can use to remove newly added assignments
  emptyAssignment.get('guid')?.setValue(generateUUID());
  
  emptyAssignment.get('sequence')?.setValue(this.filteredRotaDayAssignments.length + 1);
  emptyAssignment.get('isAdded')?.setValue(true);

  let newAssignments = this.filteredRotaDayAssignments.map(element => element);

  newAssignments.push(emptyAssignment);

  this.filteredRotaDayAssignments = this.staffScheduleService.reassignAreaRowSpans(newAssignments)
                                                                  .sort(this.staffScheduleService.sortAssignments);;

  this.rotaDayAssignments.push(emptyAssignment);

}

deleteShift(shift: AbstractControl) : void {

  const dialogRef = this.dialog.open(ConfirmationDialog,{
    data:{
      message: 'Are you sure want to delete?',
      buttonText: {
        ok: 'Yes',
        cancel: 'No'
      }
    }
  });

  dialogRef.afterClosed().pipe(takeUntil(this.ngUnsubscribe))
  .subscribe((confirmed: boolean) => {

    const filteredFoundIndex = this.filteredRotaDayAssignments.findIndex(element => this.filterByUserIdAndAreaPositionId(element, shift));

    this.filteredRotaDayAssignments.splice(filteredFoundIndex, 1);
  
    const foundIndex = this.rotaDayAssignments.findIndex(element => this.filterByUserIdAndAreaPositionId(element, shift));
     
    this.rotaDayAssignments.splice(foundIndex, 1);
  
    this.filteredRotaDayAssignments = this.staffScheduleService.reassignAreaRowSpans(this.filteredRotaDayAssignments)
                                                                  .sort(this.staffScheduleService.sortAssignments);;
    
  });




}

  private filterByUserIdAndAreaPositionId(element: AbstractControl<any, any>, shift: AbstractControl<any, any>): boolean {

return shift.get('rotationAreaPositionId')?.value < 0 ?
     (element.get('userId')?.value === shift.get('userId')?.value &&
      element.get('rotationAreaPositionId')?.value === shift.get('rotationAreaPositionId')?.value)
      :
      element.get('rotaDayId')?.value === shift.get('rotaDayId')?.value;
  }

areaSelected(area: RotationArea, shift: AbstractControl) : void {

  shift.patchValue(area);

  // shift.get('plannedShiftStartTime')?.setValue(role.startTime);
  // shift.get('plannedShiftEndTime')?.setValue(role.endTime);
  // shift.get('plannedBreakStartTime')?.setValue(role.breakStartTime);
  // shift.get('plannedBreakEndTime')?.setValue(role.breakEndTime);
  
}

}


