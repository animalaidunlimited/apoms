import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { generateUUID } from 'src/app/core/helpers/utils';
import { UserDetails } from 'src/app/core/models/user';
import { UserDetailsService } from 'src/app/core/services/user-details/user-details.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { FormGroup, FormBuilder, FormArray, AbstractControl, FormControl, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { map, startWith, takeUntil, take } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from 'src/app/core/components/confirm-dialog/confirmation-dialog.component';
import { RotationPeriodValidator } from 'src/app/core/validators/rotation-period.validator';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { RotaService } from 'src/app/modules/staff-rota/services/rota.service';
import { Role, Rota, RotaVersion } from 'src/app/core/models/rota';
import { SnackbarService } from './../../../core/services/snackbar/snackbar.service';

/*
//Keep these here for the moment because we'll use them when we upgrade to Angular 14
interface StaffTask{
  staffTaskId: string;
  assignedUserId: number;
  employeeNumber: string;
  firstName: string;
}

interface RotationPeriod{
  rotationPeriodId: string;
  sequence: number;
  startDate: Date | string;
  endDate: Date | string;
}

interface AreaShift{
  staffTaskId: string;
  rotationPeriodId: string;
  sequence: number;
  roleId: number;
  roleName: string;
  }
  */




@Component({
  selector: 'app-staff-rota',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './staff-rota-page.component.html',
  styleUrls: ['./staff-rota-page.component.scss']
})

export class StaffRotaPageComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  private ngUnsubscribeFromMatrixChanges = new Subject();

  errorMatcher = new CrossFieldErrorMatcher();

  filteredUsers!: Observable<UserDetails[]> | undefined;

  jobRoles$ = new BehaviorSubject<Role[]>([{roleId: 1, role: 'N01', color: 'lightgreen'}, {roleId: 2, role: 'N02', color: 'lightblue'},
  {roleId: 3, role: 'N03', color: 'lightcyan'}, {roleId: 4, role: 'HX1', color: 'lightpurple'}, {roleId: 5, role: 'HX2', color: 'lightyellow'}, {roleId: 6, role: 'HX3', color: 'lightsalmon'}]);
  
  periodPreviousValue = {};

  rotas$: BehaviorSubject<Rota[]>;
  rotaVersions$!: BehaviorSubject<RotaVersion[]>;

  rotaForm:FormGroup = this.fb.group({
    currentRota: this.fb.group({
      rotaId: undefined,
      rotaName: ["", Validators.required],
      defaultRota: [false],
      rotaVersionId: undefined,
      rotaVersionName: ["", Validators.required],
      defaultRotaVersion: [false],
      editing: true
    }),
    rotationPeriodArray: this.fb.array([]),
    areaShiftArray: this.fb.array([]),
    matrix: this.fb.group([])
  });
  
  selectedJobRoles : string[] = [];

  unassignedUsers = new BehaviorSubject<UserDetails[]>([])
  userList!: UserDetails[];

  get getRotationPeriodArray() : FormArray {
    return this.rotaForm.get('rotationPeriodArray') as FormArray || this.fb.array([]);
  }

  get getAreaShiftArray() : FormArray {
    return this.rotaForm.get('areaShiftArray') as FormArray || this.fb.array([]);
  }

  get getMatrix() : FormGroup {
    return this.rotaForm.get('matrix') as FormGroup || this.fb.array([]);
  }

  get getCurrentRota() : FormGroup {
    return this.rotaForm.get('currentRota') as FormGroup;
  }

  constructor(
    private userDetailsService: UserDetailsService,
    private userOptionsService: UserOptionsService,
    private rotaService: RotaService,
    private snackbarService: SnackbarService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private rotationPeriodValidator: RotationPeriodValidator,
    private changeDetector: ChangeDetectorRef
    ) {      

      this.rotas$ = this.rotaService.rotas;
      this.rotaVersions$ = this.rotaService.rotaVersions;

      this.initialiseRotas();      

      this.getCurrentRota.get("rotaId")?.valueChanges.subscribe(rotaId => {
        
        this.rotaService.setRotaVersionRotaId(rotaId);
        this.changeDetector.detectChanges();
        console.log(this.rotaVersions$.value);
      })
      

  }

  ngOnInit(): void {

    //Go and get the user list so we can populate the drag list
    this.userDetailsService.getUsersByIdRange(this.userOptionsService.getUserName()).then((userListData: UserDetails[])=>{
      this.userList = userListData;

      //Let's wait until the user list is populated before we do any further initialisation
      this.initialiseArrays();  

    });

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private async initialiseRotas() : Promise<void> {

    //Let's do this second to avoid the response coming back as we're setting up the behaviour subjects above.
    let currentRota = await this.rotaService.initialiseRotas();

    console.log(currentRota);

    this.getCurrentRota.patchValue(currentRota);

  } 

  private initialiseArrays() {

    //Watch the arrays so we can respond to the changes
    // this.watchArray("rotationPeriodArray");
    // this.watchArray("areaShiftArray");

    //Set up some defaults so we're not empty
    this.addAreaShift();
    this.addRotationPeriod(true);

    this.changeDetector.detectChanges();
  }

  updateMatrix() : void {
      
      for(let shift of this.getAreaShiftArray.controls){

        for(let period of this.getRotationPeriodArray.controls){          

          this.addAssignedStaffControlToMatrix(shift.get('areaShiftId')?.value, period.get('rotationPeriodId')?.value);

        }
      }

  }

  addAreaShift(){

    this.getAreaShiftArray.push(this.generateDefaultAreaShift());  
    this.updateMatrix();

  }

  private generateDefaultAreaShift() : FormGroup {

    return this.fb.group({
                          areaShiftId: generateUUID(),
                          sequence: (this.getAreaShiftArray?.length || -1) + 1,
                          roleId: undefined,
                          roleName: "",
                          color: "white"
                        });
  }

  addRotationPeriod(updateMatrix: boolean) : string {

    const defaultRotationPeriod = this.generateDefaultRotationPeriod();

    this.getRotationPeriodArray.push(defaultRotationPeriod);

    if(updateMatrix){
      this.updateMatrix();
    }

    return defaultRotationPeriod.get('rotationPeriodId')?.value;


  }

  private generateDefaultRotationPeriod() : FormGroup {

    const maxSequence = this.getRotationPeriodArray.controls.length === 0 ? 0 : this.getRotationPeriodArray.controls.reduce((a,b) => a.value.sequence < b.value.sequence ? b : a).value.sequence + 1

    const groupId = generateUUID();

    let newGroup = this.fb.group({
      rotationPeriodId: groupId,
      sequence: maxSequence,
      name: "",
      startDate: ["",Validators.required,this.rotationPeriodValidator.checkDateNotInExistingRange(groupId, this.getRotationPeriodArray)],
      endDate: ["",Validators.required,this.rotationPeriodValidator.checkDateNotInExistingRange(groupId, this.getRotationPeriodArray)],
      editable: true,
      checkUnassigned: false});

      return newGroup;

  }

  private _filter(rotationPeriodId: string, value: string | undefined): UserDetails[] {

    const searchValue = typeof(value) === "object" ? "" : (value || "");

    const existingUsers: number[] = this.filterStaffAssignments(rotationPeriodId, 1)
                              .map(element => this.getMatrix.get(element)?.get('assignedUser')?.value?.userId );
    
    return this.userList.filter(user => {
      
      return (user.employeeNumber + ' - ' + user.firstName).toLowerCase().includes(searchValue.toLowerCase()) &&
      !existingUsers.some(existingUser => existingUser === user.userId)
    
    });
  }

  setFilteredUsers(rotationPeriodId: string, control: AbstractControl | null | undefined): void {

    if(!control){
      return;
    };

    this.filteredUsers = control?.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(rotationPeriodId, value)),
    );

    this.changeDetector.detectChanges();
  }

  addAssignedStaffControlToMatrix(areaShiftId: string, rotationPeriodId: string, assignedUser?: UserDetails){

    let staffTaskId = this.getCoords(areaShiftId, rotationPeriodId);

    const addedTaskDetails = this.fb.group({
      staffTaskId: staffTaskId,
      assignedUser: assignedUser});      

    if(!this.getMatrix.get(staffTaskId)){
      this.getMatrix.addControl(staffTaskId, addedTaskDetails);
    }

    this.changeDetector.detectChanges();

  }

  getGroupPeriodAssignedStaff(areaShiftId: string, rotationPeriodId: string) {

    return this.getMatrix?.get(this.getCoords(areaShiftId, rotationPeriodId));  

  }

  getCoords(areaShiftId: string, rotationPeriodId: string): string {
    return `${areaShiftId}|${rotationPeriodId}`
  }

  groupSelected($event: MatSelectChange, areaShift: AbstractControl) : void {

    const selectedRole: Role | undefined = $event.value;

    areaShift.get('color')?.setValue(selectedRole?.color)

    this.selectedJobRoles.push(selectedRole?.role || "");

  }

  editPeriod(period: AbstractControl, editable: boolean) : void {

    this.periodPreviousValue = period.value;

    period?.get('editable')?.setValue(editable);

  }

  cancelPeriodEdit(period: AbstractControl, editable: boolean) : void {

    period.patchValue(this.periodPreviousValue);

    period?.get('editable')?.setValue(editable);

  }

  displayFn(user: UserDetails): string {

    return user && user.userId ? user.employeeNumber + ' - ' + user.firstName : '';
  }

  copyRotationPeriod(period : AbstractControl, cycle: boolean){

    const newRotationPeriodId = this.addRotationPeriod(false);

    const staffAssignmentAreaShifts = this.filterStaffAssignments(period.get('rotationPeriodId')?.value, 1)
                               .map(element => {
                                
                                let staffAssignment = this.getMatrix.get(element);

                                return {
                                    areaShiftId: "" + staffAssignment?.get('staffTaskId')?.value.split('|')[0],
                                    assignedUser: staffAssignment?.get('assignedUser')?.value as UserDetails
                                  };

                              
                              });

    let populatedAssignments = staffAssignmentAreaShifts;

    if(cycle){

      populatedAssignments = staffAssignmentAreaShifts.filter(element => !!element?.assignedUser?.userId);

      const popped = populatedAssignments.pop();

      if(popped) populatedAssignments.unshift(popped);      

    }    

    for(let i = 0, assigned = 0; i < staffAssignmentAreaShifts.length; i++){

      let assignedUser = undefined;
      
      if(!!staffAssignmentAreaShifts[i].assignedUser?.userId || !cycle){

        assignedUser = populatedAssignments[assigned]?.assignedUser;
         assigned++;
      }

      this.addAssignedStaffControlToMatrix(staffAssignmentAreaShifts[i]?.areaShiftId, newRotationPeriodId, assignedUser);
      
   
    }

  this.changeDetector.detectChanges();

  }

  saveRotationPeriod(period: AbstractControl){

    console.log(period)

  }

  private filterStaffAssignments(filterValue: string, periodOrShift: number) : string[] {

    let staffAssignments = Object.keys(this.getMatrix.controls);

    //We use includes because the filterValue could be multiple comma separated ids.
    staffAssignments = staffAssignments.filter(assignment => filterValue.includes(assignment.split('|')[periodOrShift]));

    return staffAssignments;
  }

  deleteRotationPeriod(period: AbstractControl) : void {
    
    this.confirm('Are you sure you want to remove this period?').subscribe(response => {

      if(response === true){
        
        const index = this.getRotationPeriodArray.controls.findIndex(element => element?.get('rotationPeriodId')?.value === period.get('rotationPeriodId')?.value );
        
        this.getRotationPeriodArray.removeAt(index);
        this.updateUnassignedStaffList();

      }
    });
    
  }

  deleteAreaShift(areaShift: AbstractControl) : void
 {

  this.confirm('Are you sure you want to remove this shift?').subscribe(response => {
    if(response === true){
      

      const index = this.getAreaShiftArray.controls.findIndex(element => element?.get('areaShiftId')?.value === areaShift.get('areaShiftId')?.value );

      this.getAreaShiftArray.removeAt(index);
      this.updateUnassignedStaffList(); 

    }
  });

 } 
 
 confirm(message: string) : Observable<any> {

  const dialogRef = this.dialog.open(ConfirmationDialog,{
    data:{
      message: message,
      buttonText: {
        ok: 'Yes',
        cancel: 'No'
      }
    }
  });

  return dialogRef.afterClosed()
  .pipe(takeUntil(this.ngUnsubscribe));  

 }


 checkUnassignedStaff(period: AbstractControl, checked: boolean) : void {

  this.getRotationPeriodArray.controls.some(rotationPeriod => {
    if(rotationPeriod.get('rotationPeriodId')?.value === period.get('rotationPeriodId')?.value){

      rotationPeriod.get('checkUnassigned')?.setValue(checked);

    }

    return false;
  });

  this.updateUnassignedStaffList();

 }

 updateUnassignedStaffList() : void {

  this.ngUnsubscribeFromMatrixChanges.next();

  const periodsToCheck = this.getRotationPeriodArray.controls.map(period => {

                                  if(period.get('checkUnassigned')?.value === true){
                                    return period.get('rotationPeriodId')?.value;
                                  }

                                }).join(',');

  if(periodsToCheck === ""){
    this.unassignedUsers.next([]);    
  }
  else {

    //We now need to watch the matrix for changes
    this.getMatrix.valueChanges.pipe(takeUntil(this.ngUnsubscribeFromMatrixChanges)).subscribe(() => {

      this.updateUnassignedStaffList();

    })

    const assignedStaff = this.filterStaffAssignments(periodsToCheck, 1);

    const unassigned = this.userList.filter(user => {

      for(const staff of assignedStaff){

        const currentStaff = this.getMatrix.get(staff)?.get("assignedUser")?.value?.userId as number | null;

        if(user.userId === currentStaff){
          return false;
        }

      }

      return true;

    });

    this.unassignedUsers.next(unassigned);
    this.changeDetector.detectChanges();

  }


 }

 rotaSelected($event: any){

  console.log($event);

 }

 rotaVersionSelected($event: any){

  console.log($event);

 }

 resetCurrentRota() : void {

  this.getCurrentRota.get('rotaId')?.reset();
  this.getCurrentRota.get('rotaVersionId')?.reset();

 }

 editRota() : void {

  this.getCurrentRota?.get('editing')?.setValue(true);
  this.changeDetector.detectChanges();

}

 saveRota() : void {

  const newRotaNames: {rotaName: string, rotaVersionName: string} = this.getCurrentRota?.value;

  this.getCurrentRota?.get('editing')?.setValue(false);

  const newRota: Rota = {
    rotaId: 1,
    rotaName: newRotaNames.rotaName,
    defaultRota: true,
    rotaVersions: [
      {
        rotaId: 1,
        rotaVersionId: 1,
        rotaVersionName: newRotaNames.rotaVersionName,
        defaultRotaVersion: true
      }
    ]
  };
  this.getCurrentRota.get('editing')?.setValue(false);

  let result = this.rotaService.upsertRota(newRota);

  if(result.success === 1) {
    this.getCurrentRota.get('rotaId')?.setValue(result.rotaId);
    this.getCurrentRota.get('rotaVersionId')?.setValue(result.rotaVersionId);
    this.snackbarService.successSnackBar("Rota added successfully", "OK");
  }
  else {
    this.snackbarService.errorSnackBar("ERR: SRP-543: Error adding rota, please see administrator", "OK");
  }

  this.changeDetector.detectChanges();



 }

}