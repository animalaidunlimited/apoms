import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { UserDetails } from 'src/app/core/models/user';
import { UserDetailsService } from 'src/app/core/services/user-details/user-details.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AbstractControl, FormGroup, FormArray } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from 'src/app/core/components/confirm-dialog/confirmation-dialog.component';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { RotaService } from 'src/app/modules/staff-rota/services/rota.service';
import { Role, Rota, RotaVersion } from 'src/app/core/models/rota';
import { SnackbarService } from './../../../core/services/snackbar/snackbar.service';
 
@Component({
  selector: 'app-staff-rota',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './staff-rota-page.component.html',
  styleUrls: ['./staff-rota-page.component.scss']
})

export class StaffRotaPageComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  private ngUnsubscribeFromMatrixChanges = new Subject();

  editingRotaVersion = {rotaVersionId: 0, rotaVersionName: ""};
  editingRota = {};

  errorMatcher = new CrossFieldErrorMatcher();

  filteredUsers!: Observable<UserDetails[]> | undefined;

  jobRoles$ = new BehaviorSubject<Role[]>([{roleId: 1, role: 'N01', color: 'lightgreen'}, {roleId: 2, role: 'N02', color: 'lightblue'},
  {roleId: 3, role: 'N03', color: 'lightcyan'}, {roleId: 4, role: 'HX1', color: 'lightpurple'}, {roleId: 5, role: 'HX2', color: 'lightyellow'}, {roleId: 6, role: 'HX3', color: 'lightsalmon'}]);
  
  rotaForm: FormGroup;

  rotas$: BehaviorSubject<Rota[]>;
  rotaVersions$!: BehaviorSubject<RotaVersion[]>;
  
  selectedJobRoles : string[] = [];

  unassignedUsers = new BehaviorSubject<UserDetails[]>([]);

  userList!: UserDetails[];

  public get getCurrentRota() : FormGroup {
    return this.rotaForm.get('currentRota') as FormGroup;
  }

  public get getRotationPeriodArray() : FormArray {
    return this.rotaForm.get('rotationPeriodArray') as FormArray;
  }

  public get getAreaShiftArray() : FormArray {
    return this.rotaForm.get('areaShiftArray') as FormArray;
  }

  constructor(
    private userDetailsService: UserDetailsService,
    private userOptionsService: UserOptionsService,
    private rotaService: RotaService,
    private snackbarService: SnackbarService,
    public dialog: MatDialog,
    private changeDetector: ChangeDetectorRef
    ) {      

      this.rotas$ = this.rotaService.rotas;
      this.rotaVersions$ = this.rotaService.rotaVersions;

      this.rotaForm = this.rotaService.getRotaForm;

      this.rotaService.initialiseRotas();

  }

  ngOnInit(): void {
    this.initialiseUsers();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private initialiseUsers(): void {
    //Go and get the user list so we can populate the drag list
    this.userDetailsService.getUsersByIdRange(this.userOptionsService.getUserName()).then((userListData: UserDetails[])=>{
      this.userList = userListData;

      //Let's wait until the user list is populated before we do any further initialisation
      this.rotaService.initialiseArrays();  
      this.changeDetector.detectChanges();

    });
  }


  addRota() : void {
    this.editingRota = this.getCurrentRota.value;

    this.rotaService.addRota();
  }

  addRotaVersion() : void {

    this.storeCurrentRotaVersion();

    this.getCurrentRota.get('editingRotaVersion')?.setValue(true);
    this.getCurrentRota.get('rotaVersionId')?.reset();
    this.getCurrentRota.get('rotaVersionName')?.reset();
    this.getCurrentRota.get('defaultRotaVersion')?.reset();

  }

  addRotationPeriod(updateMatrix: boolean) : void {
    this.rotaService.addRotationPeriod(updateMatrix);
  }

  addAreaShift() : void {
    this.rotaService.addAreaShift();
  }

  saveRotaVersion() : void {

    this.rotaService.saveRotaVersion(this.getCurrentRotaVersionDetails()).then(response => {

      if(response.rotaVersionSuccess === 1){
        this.getCurrentRota.get('rotaId')?.enable();
        
      }
      else {

        this.snackbarService.errorSnackBar("ERR: SRP-255: Error updating rota version, please see administrator", "OK");

      }

    });

  }

  private getCurrentRotaVersionDetails() : RotaVersion {
    return {
      rotaId: this.getCurrentRota.get('rotaId')?.value,
      rotaVersionId: this.getCurrentRota.get('rotaVersionId')?.value,
      rotaVersionName: this.getCurrentRota.get('rotaVersionName')?.value,
      defaultRotaVersion: this.getCurrentRota.get('defaultRotaVersion')?.value,
      rotaVersionDeleted: this.getCurrentRota.get('rotaVersionDeleted')?.value
    };
  }

  editRotaVersion() : void {

    this.storeCurrentRotaVersion();
    this.getCurrentRota.get('editingRotaVersion')?.setValue(true);
    this.getCurrentRota.get('rotaId')?.disable();

  }

  private storeCurrentRotaVersion() {
    this.editingRotaVersion = {
      rotaVersionId: this.getCurrentRota.get('rotaVersionId')?.value,
      rotaVersionName: this.getCurrentRota.get('rotaVersionName')?.value,
    };
  }

  cancelRotaVersionEdit() : void {

    this.getCurrentRota.get('editingRotaVersion')?.setValue(false);
    this.getCurrentRota.get('rotaId')?.enable();
    this.getCurrentRota.get('rotaVersionId')?.setValue(this.editingRotaVersion.rotaVersionId);
    this.getCurrentRota.get('rotaVersionName')?.setValue(this.editingRotaVersion.rotaVersionName);
    this.editingRotaVersion = {rotaVersionId: 0, rotaVersionName: ""};
    
  }

  private _filter(rotationPeriodId: string, value: string | undefined): UserDetails[] {

    const searchValue = typeof(value) === "object" ? "" : (value || "");

    const existingUsers: number[] = this.rotaService.filterStaffAssignments(rotationPeriodId, 1)
                              .map(element => this.rotaService.getMatrix.get(element)?.get('assignedUser')?.value?.userId );
    
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



  getGroupPeriodAssignedStaff(areaShiftId: string, rotationPeriodId: string) {

    return this.rotaService.getMatrix?.get(this.rotaService.getCoords(areaShiftId, rotationPeriodId));  

  }

  groupSelected($event: MatSelectChange, areaShift: AbstractControl) : void {

    const selectedRole: Role | undefined = $event.value;

    areaShift.get('color')?.setValue(selectedRole?.color)

    this.selectedJobRoles.push(selectedRole?.role || "");

  }

  displayFn(user: UserDetails): string {

    return user && user.userId ? user.employeeNumber + ' - ' + user.firstName : '';
  }

  deleteAreaShift(areaShift: AbstractControl) : void
 {

  this.confirm('Are you sure you want to remove this shift?').subscribe(response => {
    if(response === true){

      this.rotaService.deleteAreaShift(areaShift);
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

 rotaSelected($event: MatSelectChange){

  const defaultRotaVersion = this.rotaVersions$.value.find(version => version.rotaId === $event.value && version.defaultRotaVersion)

  this.getCurrentRota.get('rotaVersionId')?.setValue(defaultRotaVersion?.rotaVersionId);
  this.getCurrentRota.get('rotaVersionName')?.setValue(defaultRotaVersion?.rotaVersionName);
  this.getCurrentRota.get('defaultRotaVersion')?.setValue(defaultRotaVersion?.defaultRotaVersion);

  const rota = this.rotas$.value.find(element => element.rotaId === $event.value);

  this.getCurrentRota.get('defaultRota')?.setValue(rota?.defaultRota);

 }

 rotaVersionSelected($event: any){

  const version = this.rotaVersions$.value.find(element => element.rotaVersionId === $event.value);

  this.getCurrentRota.get('rotaVersionName')?.setValue(version?.rotaVersionName);
  this.getCurrentRota.get('defaultRotaVersion')?.setValue(version?.defaultRotaVersion);

 }

 deleteRota() : void {

  this.confirm('Are you sure you want to remove this rota?').subscribe(response => {
    if(response === true){ 
      this.getCurrentRota?.get('rotaDeleted')?.setValue(true);        
      this.saveRota();
    }
  });
 }

 deleteRotaVersion() : void {

  this.confirm('Are you sure you want to remove this rota version?').subscribe(response => {
    if(response === true){   
      this.getCurrentRota.get('rotaVersionDeleted')?.setValue(true);      
      this.saveRotaVersion();
    }
  });
 }

 editRota() : void {

  this.editingRota = this.getCurrentRota.value;

  this.getCurrentRota.get('editingRota')?.setValue(true);
  this.getCurrentRota.get('rotaVersionId')?.disable();  

  const foundRota = this.rotas$.value.find(element => element.rotaId === this.getCurrentRota.get('rotaId')?.value);

  this.getCurrentRota.get('rotaName')?.setValue(foundRota?.rotaName);  

  this.changeDetector.detectChanges();

}

cancelRotaEdit() : void {

  this.getCurrentRota.patchValue(this.editingRota);
  this.getCurrentRota.get('rotaVersionId')?.enable();

}

 saveRota() : void {

    this.rotaService.upsertRota().then(result => {

      if(result.rotaSuccess === 1 && result.rotaVersionSuccess === 1) {  
    
        this.snackbarService.successSnackBar("Rota added successfully", "OK");
      }
      else {

        this.snackbarService.errorSnackBar("ERR: SRP-633: Error adding rota, please see administrator", "OK");
      }
    
      this.changeDetector.detectChanges();

  });

 }

 updateUnassignedStaffList() : void {
  
  this.ngUnsubscribeFromMatrixChanges.next();

  const periodsToCheck = this.rotaService.getRotationPeriodArray.controls.map(period => {

                                  if(period.get('checkUnassigned')?.value === true){
                                    return period.get('rotationPeriodId')?.value;
                                  }

                                }).join(',');

  if(periodsToCheck === ""){
    this.unassignedUsers.next([]);    
  }
  else {

    //We now need to watch the matrix for changes
    this.rotaService.getMatrix.valueChanges.pipe(takeUntil(this.ngUnsubscribeFromMatrixChanges)).subscribe(() => {

      this.updateUnassignedStaffList();

    })

    const assignedStaff = this.rotaService.filterStaffAssignments(periodsToCheck, 1);

    const unassigned = this.userList.filter(user => {

      for(const staff of assignedStaff){

        const currentStaff = this.rotaService.getMatrix.get(staff)?.get("assignedUser")?.value?.userId as number | null;

        if(user.userId === currentStaff){
          return false;
        }

      }

      return true;

    });

    this.unassignedUsers.next(unassigned);

  }


 }

}