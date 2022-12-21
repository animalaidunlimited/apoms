import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { UserDetails } from 'src/app/core/models/user';
import { UserDetailsService } from 'src/app/core/services/user-details/user-details.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AbstractControl, FormGroup, FormArray } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { map, skip, startWith, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from 'src/app/core/components/confirm-dialog/confirmation-dialog.component';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { RotaService } from 'src/app/modules/staff-rota/services/rota.service';
import { AssignedUser, Rota, RotaVersion } from 'src/app/core/models/rota';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
 
@Component({
  selector: 'app-staff-rotation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './staff-rotation-page.component.html',
  styleUrls: ['./staff-rotation-page.component.scss']
})

export class StaffRotationPageComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  addAreaShiftDisabled$: Observable<boolean>;

  beginningOfRange = false;

  dataSource: BehaviorSubject<AbstractControl[]>;

  displayColumns: Observable<string[]>;

  editingRotaVersion = {rotaVersionId: 0, rotaVersionName: ""};
  editingRota = {};

  endOfRange = false;

  errorMatcher = new CrossFieldErrorMatcher();

  filteredUsers!: Observable<UserDetails[]> | undefined;
  
  rotaForm: FormGroup;

  rotas$: BehaviorSubject<Rota[]>;

  rotationPeriods: Observable<string[]>;

  rotaVersions$!: BehaviorSubject<RotaVersion[]>;  

  unassignedUsers!: BehaviorSubject<UserDetails[]>;

  userList!: BehaviorSubject<UserDetails[]>;

  public get getCurrentRota() : FormGroup {
    return this.rotaForm.get('currentRota') as FormGroup;
  }

  public get getAreaShiftArray() : FormArray {
    return this.rotaForm.get('areaShiftArray') as FormArray;
  }

  public get getMatrix() : FormGroup {
    return this.rotaForm.get('matrix') as FormGroup;
  }

  constructor(
    private userDetailsService: UserDetailsService,
    private rotaService: RotaService,
    private snackbarService: SnackbarService,
    public dialog: MatDialog,
    private changeDetector: ChangeDetectorRef
    ) {

      this.initialiseRotas();

      this.rotas$ = this.rotaService.rotas;

      this.rotaVersions$ = this.rotaService.rotaVersions;

      this.rotaForm = this.rotaService.getRotaForm;
      
      this.unassignedUsers = this.rotaService.unassignedUsers;

      this.dataSource = this.rotaService.dataSource;

      this.rotationPeriods = this.dataSource.pipe(skip(1), takeUntil(this.ngUnsubscribe),map(rotation => this.displayColumnsPipe(rotation, 2)));

      this.displayColumns = this.dataSource.pipe(skip(1), takeUntil(this.ngUnsubscribe),map(rotation => this.displayColumnsPipe(rotation, 0)));

      this.addAreaShiftDisabled$ = this.rotationPeriods.pipe(takeUntil(this.ngUnsubscribe),map(periods => periods.length === 0));      
      
  }

  initialiseRotas() : void {

    this.userList = this.userDetailsService.getUserList();

    this.rotaService.initialiseRotas().then(complete => {

      if(complete){
        this.rotaService.initialiseArrays();
      }
    });   
    

  }

  displayColumnsPipe(rotation: AbstractControl[], startIndex: number) : string[] {

    if(!rotation || rotation?.length === 0){
      return startIndex === 0 ? ["area","areaShift","move"] : [];
      }

      let columns = Object.keys(rotation[0].value)
                    .map(control => (control === "areaShift" || control === "area") ? control : control.split("|")[1])
                    .splice(startIndex);

      if(startIndex === 0){
        columns.push("move");
      }

      return columns;
  }

  ngOnInit(): void { 

    this.rotaService.beginningOrEndRotation.pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {

      if(!value) {
        this.beginningOfRange = false;
        this.endOfRange = false;
      }

      if(value === 'endOfRange'){
        this.beginningOfRange = false;
        this.endOfRange = true;
      }

      if(value === 'beginningOfRange'){
        this.beginningOfRange = true;
        this.endOfRange = false;
      }

    })

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  //Rota Functions

  addRota() : void {
    this.editingRota = this.getCurrentRota.value;

    this.rotaService.addRota();
  } 

  rotaSelected($event: MatSelectChange) : void {
    
    const defaultRotaVersion = this.rotaVersions$.value.find(version => version.rotaId === $event.value && version.defaultRotaVersion);    
    
    this.getCurrentRota.get('rotaVersionId')?.setValue(defaultRotaVersion?.rotaVersionId);
    this.getCurrentRota.get('rotaVersionName')?.setValue(defaultRotaVersion?.rotaVersionName);
    this.getCurrentRota.get('defaultRotaVersion')?.setValue(defaultRotaVersion?.defaultRotaVersion);

    const rota = this.rotas$.value.find(element => element.rotaId === $event.value);

    this.rotaService.initialiseArrays();

    this.getCurrentRota.get('defaultRota')?.setValue(rota?.defaultRota);
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

  if(Object.keys(this.editingRota).length === 0){
    this.getCurrentRota.get('rotaName')?.reset();
    this.getCurrentRota.get('rotaVersionName')?.reset();
  }

  this.getCurrentRota.patchValue(this.editingRota);
  this.getCurrentRota.get('rotaVersionId')?.enable();

  }

  deleteRota() : void {

  this.confirm('Are you sure you want to remove this rota?').subscribe(response => {
    if(response === true){ 
      this.getCurrentRota?.get('rotaDeleted')?.setValue(true);        
      this.saveRota();
    }
  });
  }

  saveRota() : void {

    this.rotaService.upsertRota().then(result => {

      if(result.rotaSuccess === 1 && result.rotaVersionSuccess === 1) {  
    
        this.snackbarService.successSnackBar("Rota added successfully", "OK");
      }
      else {

        this.snackbarService.errorSnackBar("ERR: SRP-354: Error adding rota, please see administrator", "OK");
      }
    
      this.changeDetector.detectChanges();

  });

  }

  //Rota Version Functions

  addRotaVersion() : void {

    this.storeCurrentRotaVersion();

    this.getCurrentRota.get('editingRotaVersion')?.setValue(true);
    this.getCurrentRota.get('rotaVersionId')?.reset();
    this.getCurrentRota.get('rotaVersionName')?.reset();
    this.getCurrentRota.get('defaultRotaVersion')?.reset();

  }

  saveRotaVersion() : void {

    this.rotaService.saveRotaVersion(this.getCurrentRotaVersionDetails()).then(response => {

      if(response.rotaVersionSuccess === 1){
        this.getCurrentRota.get('rotaId')?.enable();        
      }
      else {
        this.snackbarService.errorSnackBar("ERR: SRP-243: Error updating rota version, please see administrator", "OK");
      }

    });

  }

  rotaVersionSelected($event: any): void {

  const version = this.rotaVersions$.value.find(element => element.rotaVersionId === $event.value);

  this.getCurrentRota.get('rotaVersionName')?.setValue(version?.rotaVersionName);
  this.getCurrentRota.get('defaultRotaVersion')?.setValue(version?.defaultRotaVersion);
 
  this.rotaService.initialiseArrays();
  }

  editRotaVersion() : void {

    this.storeCurrentRotaVersion();
    this.getCurrentRota.get('editingRotaVersion')?.setValue(true);
    this.getCurrentRota.get('rotaId')?.disable();

  }

  cancelRotaVersionEdit() : void {

    this.getCurrentRota.get('editingRotaVersion')?.setValue(false);
    this.getCurrentRota.get('rotaId')?.enable();
    this.getCurrentRota.get('rotaVersionId')?.setValue(this.editingRotaVersion.rotaVersionId);
    this.getCurrentRota.get('rotaVersionName')?.setValue(this.editingRotaVersion.rotaVersionName);
    this.editingRotaVersion = {rotaVersionId: 0, rotaVersionName: ""};
    
  }

  deleteRotaVersion() : void {

  this.confirm('Are you sure you want to remove this rota version?').subscribe(response => {
    if(response === true){   
      this.getCurrentRota.get('rotaVersionDeleted')?.setValue(true);      
      this.saveRotaVersion();
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

  private storeCurrentRotaVersion() : void {
    this.editingRotaVersion = {
      rotaVersionId: this.getCurrentRota.get('rotaVersionId')?.value,
      rotaVersionName: this.getCurrentRota.get('rotaVersionName')?.value,
    };
  }

  //Rotation Period Functions

  addRotationPeriod(updateMatrix: boolean) : void {
    this.rotaService.addRotationPeriod(undefined, updateMatrix, false).then(() => {
      this.rotaService.generateTableDataSource();
    });
  }

  //Area Shift Functions

  addAreaShift() : void {
    this.rotaService.addAreaShift(undefined, true);
  }

  //Misc. Functions

  shiftLeftRotation() : void {
    this.rotaService.shiftLeftRotation();
  }

  shiftRightRotation() : void {
    this.rotaService.shiftRightRotation();
  }

  setFilteredUsers(rotationPeriodGUID: string, control: AbstractControl | null | undefined): void {

    if(!control){
      return;
    };

    this.filteredUsers = control?.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(rotationPeriodGUID, value)),
    );

    this.changeDetector.detectChanges();
  }

  private _filter(rotationPeriodGUID: string, value: string | undefined): UserDetails[] {

    const searchValue = typeof(value) === "object" ? "" : (value || "");

    const existingUsers: AssignedUser[] = this.rotaService.getStaffAssignmentsForRotationPeriod(rotationPeriodGUID);
    
    return this.userList?.value.filter(user => {
      
      return (user.employeeNumber + ' - ' + user.firstName).toLowerCase().includes(searchValue.toLowerCase()) &&
      !existingUsers.some(existingUser => existingUser.userId === user.userId)
    
    });
  }

  displayFn(user: UserDetails): string {

    if(!user){
      return '';
    }
      
    return user.employeeNumber + ' - ' + user.firstName;    
  }

  userSelectedForShift(period: string, areaShiftGUID: string, user: AbstractControl) : void {
    
    this.rotaService.checkForLeave(period, areaShiftGUID, user);

    this.rotaService.markPeriodAsDirty(period);
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

  rowDropped(droppedRow: CdkDragDrop<BehaviorSubject<AbstractControl[]>>) : void {

    if(droppedRow.currentIndex === droppedRow.previousIndex){
      return;
    }
    
    this.rotaService.moveAreaShift(droppedRow.previousIndex, droppedRow.currentIndex);
  }

}