import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormArray, UntypedFormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { BehaviorSubject, Observable, Subject} from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { generateUUID } from 'src/app/core/helpers/utils';
import { AreaShift, AreaShiftResponse, AssignedStaffResponse, AssignedUser,
         CurrentRota, Rota, RotaDay, RotaDayAssignmentResponse, RotationArea, RotationPeriod,
         RotationPeriodLeave, RotationPeriodResponse, RotationPeriodSaveResponse, RotaVersion } from 'src/app/core/models/rota';
import { UserDetails } from 'src/app/core/models/user';
import { APIService } from 'src/app/core/services/http/api.service';
import { OrganisationDetailsService } from 'src/app/core/services/organisation-details/organisation-details.service';
import { SuccessOnlyResponse } from './../../../core/models/responses';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { RotationPeriodValidator } from 'src/app/core/validators/rotation-period.validator';
import { UserDetailsService } from 'src/app/core/services/user-details/user-details.service';

interface UpsertRotaResponse{
  rotaId: number;
  rotaVersionId: number;
  rotaSuccess: number;
  rotaVersionSuccess: number;
}

@Injectable({
  providedIn: 'root'
})
export class RotaService extends APIService {
  
  private ngUnsubscribeFromMatrixChanges = new Subject();

  dataSourceForm = this.fb.group({});
  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  displayColumns = new BehaviorSubject<string[]>([]);

  endpoint = 'Rota';

  firstRotationPeriodGUID = '';
  lastRotationPeriodGUID = '';

  leaves: RotationPeriodLeave[] = [];

  offset = 0;
  periodCycleReset = true;
  periodsToShow = 1;

  rotas:BehaviorSubject<Rota[]> = new BehaviorSubject<Rota[]>([]);
  rotaVersions:BehaviorSubject<RotaVersion[]> = new BehaviorSubject<RotaVersion[]>([]);

  beginningOrEndRotation: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);

  rotaDays$ = new BehaviorSubject<RotaDayAssignmentResponse | null>(null);

  rotaForm:FormGroup = this.fb.group({
    currentRota: this.fb.group({
      rotaId: undefined,
      rotaName: ["", Validators.required],
      rotaDeleted: false,
      defaultRota: [false],
      rotaVersionId: undefined,
      rotaVersionName: ["", Validators.required],
      rotaVersionDeleted: false,
      defaultRotaVersion: [false],
      editingRota: false,
      editingRotaVersion: false
    }),
    rotationPeriodArray: this.fb.array([]),
    areaShiftArray: this.fb.array([]),
    matrix: this.fb.group([])
  });

  unassignedUsers = new BehaviorSubject<UserDetails[]>([]);

  userList: BehaviorSubject<UserDetails[]>;

  public get getRotationPeriodArray() : FormArray {
    return this.rotaForm.get('rotationPeriodArray') as FormArray || this.fb.array([]);
  }

  public get getAreaShiftArray() : FormArray {
    return this.rotaForm.get('areaShiftArray') as FormArray || this.fb.array([]);
  }

  public get getMatrix() : FormGroup {
    return this.rotaForm.get('matrix') as FormGroup || this.fb.group({});
  }

  public get getCurrentRota() : FormGroup {
    return this.rotaForm.get('currentRota') as FormGroup;
  }

  public get getRotaForm() : FormGroup {
    return this.rotaForm as FormGroup;
  }

  constructor(
    http: HttpClient,
    private fb: UntypedFormBuilder,
    private snackbar: SnackbarService,
    private userDetailsService: UserDetailsService,
    private rotationPeriodValidator: RotationPeriodValidator,
    private organisationDetails: OrganisationDetailsService) {
    super(http);

    this.userList = this.userDetailsService.getScheduleUserList();

    this.organisationDetails.organisationDetail.subscribe(organisationSettings => {

      this.periodsToShow = organisationSettings.rotaDefaults.periodsToShow;
      // this.offset = this.periodsToShow;

    });

    this.getCurrentRota.get("rotaId")?.valueChanges.subscribe(rotaId => {
        
      this.setRotaVersionRotaId(rotaId);        
    });
  }

public getRotas() : Observable<Rota[] | null> {

  let request = "/GetRotas";

  return this.getObservable(request);

}

public async initialiseRotas() : Promise<boolean> {

  return this.getRotas()
  .toPromise()
  .then(response => response as Rota[])
  .then(rotaResponse => {

    if(!rotaResponse){
      this.addRota();
      return true;
    }

    this.rotas.next(rotaResponse);

    const currentRota = rotaResponse?.find(rota => rota.defaultRota); 

    const currentRotaVersion = currentRota?.rotaVersions.find(rotaVersion => rotaVersion.defaultRotaVersion);

    //Combine the default rota and default version within that rota to produce the current rota.
    const currentRotaDetails : CurrentRota = {
      rotaId: currentRota?.rotaId,
      rotaName: currentRota?.rotaName,
      defaultRota: currentRota?.defaultRota,
      rotaDeleted: currentRota?.rotaDeleted,
      rotaVersionId: currentRotaVersion?.rotaVersionId,
      rotaVersionName: currentRotaVersion?.rotaVersionName,
      defaultRotaVersion: currentRotaVersion?.defaultRotaVersion,
      rotaVersionDeleted: currentRotaVersion?.rotaVersionDeleted,
      editing: !currentRota?.rotaId
    };

    if(currentRota){
      this.getCurrentRota.patchValue(currentRotaDetails);
    }

    return true;

  });
  
}

public async initialiseArrays() {

  this.rotaForm.setControl('matrix', this.fb.group({}));
  this.getAreaShiftArray.clear({emitEvent: false});
  this.getRotationPeriodArray.clear({emitEvent: false});
  // this.displayColumns.next([]);
  this.dataSource.next([]);

  //Set up some defaults so we're not empty
  await this.getAreaShifts().then(areaShifts => {
                                      areaShifts?.sort((a,b) => a.sortOrder - b.sortOrder)
                                                 .forEach(areaShift => this.addAreaShift(areaShift, false))
  });                                                 
  
  await this.initialiseRotationPeriods(this.periodsToShow);

  this.sortAreaShifts();
  // this.generateTableDataSource();

}

public getPeriodByGUID(rotationPeriodGUID:string) : FormGroup {

  return this.getRotationPeriodArray.controls.find(element => element.value.rotationPeriodGUID === rotationPeriodGUID) as FormGroup || this.generateDefaultRotationPeriod();

}

public markPeriodAsDirty(rotationPeriodGUID: string) : void {
  this.getRotationPeriodArray.controls.find(element => element.value.rotationPeriodGUID === rotationPeriodGUID)?.markAsDirty();
}

public async generateTableDataSource() : Promise<void> {

  let dataSource: AbstractControl[] = [];

  for(let areaShift of this.getAreaShiftArray.controls){

    let row = this.generateDataSourceRow(areaShift);
    dataSource.push(row);

  }

  this.dataSource.next(dataSource); 

}

  private generateDataSourceRow(areaShift: AbstractControl) {

    let row = this.fb.group({
      // area: [this.extractAreaFromAreaShift(areaShift)],
      areaShift: areaShift
    });

    for (let period of this.getRotationPeriodArray.controls) {

      const areaShiftGUID = areaShift.get('areaShiftGUID')?.value;
      const rotationPeriodGUID = period.get('rotationPeriodGUID')?.value;

      let controlName = this.getCoords(areaShiftGUID, rotationPeriodGUID);

      let foundControl = this.getMatrix.get(controlName);

      if (!foundControl) {
        this.addAssignedStaffControlToMatrix(areaShiftGUID, rotationPeriodGUID);
      }

      foundControl = this.getMatrix.get(controlName) as AbstractControl;

      row.addControl(controlName, foundControl, { emitEvent: false });

    }

    return row;
  }

public extractAreaFromAreaShift(areaShift:AbstractControl) : RotationArea {

  return {
    areaRowSpan: areaShift.get('areaRowSpan')?.value,
    scheduleManagerId: -1,
    scheduleManager: "",
    rotationAreaColour: areaShift.get('rotationAreaColour')?.value,
    rotationArea: areaShift.get('rotationArea')?.value,
    rotationAreaId: areaShift.get('rotationAreaId')?.value,
    rotationAreaSortOrder: areaShift.get('rotationAreaSortOrder')?.value
  }
  
}


async initialiseRotationPeriods(periodsToShow: number) {

  const rotaVersionId = this.getCurrentRota.get("rotaVersionId")?.value || -1;

  await this.getRotationPeriods(rotaVersionId, periodsToShow, this.offset).then(async periods => {

    this.firstRotationPeriodGUID = periods?.firstRotationPeriodGUID || '';
    this.lastRotationPeriodGUID = periods?.lastRotationPeriodGUID || '';    

    if(!periods?.rotationPeriods){      
      this.getRotationPeriodArray.clear();
      this.generateTableDataSource();
      return;
    }
    
    for(let period of periods?.rotationPeriods){

      await this.addRotationPeriod(period, true, false);

    }    
    
    if(this.getRotationPeriodArray.controls[0]?.get('rotationPeriodGUID')?.value === this.firstRotationPeriodGUID){
      this.beginningOrEndRotation.next('beginningOfRange');
    }
    else if(this.getRotationPeriodArray.controls[this.getRotationPeriodArray?.length - 1]?.get('rotationPeriodGUID')?.value === this.lastRotationPeriodGUID){
      this.beginningOrEndRotation.next('endOfRange');
    }
    else {
      this.beginningOrEndRotation.next('undefined')
    }
  
    const periodGUIDs = this.getRotationPeriodArray.controls.map(period => period.get('rotationPeriodGUID')?.value).join(',');
  
    this.loadMatrixForPeriods(periodGUIDs || "");
  
  });

}

// API Calls

getRotationPeriods(rotaVersionId: number, periodsToShow?: number, offset?: number, isLocked?: number) : Promise<RotationPeriodResponse | null> {  

  periodsToShow = periodsToShow || 1;
  offset = offset || 0;
  isLocked = isLocked || 0;

  return this.get(`/GetRotationPeriods?rotaVersionId=${rotaVersionId}&limit=${periodsToShow}&offset=${offset}&isLocked=${isLocked}`);

}

getRotationPeriod(rotaVersionId: number, rotationPeriodId: number) : Promise<RotationPeriodResponse | null> {  

  return this.get(`/GetRotationPeriod?rotaVersionId=${rotaVersionId}&rotationPeriodId=${rotationPeriodId}`);

}

getAreaShifts() : Promise<AreaShift[] | null> {
  
  const rotaVersionId = this.getCurrentRota.get("rotaVersionId")?.value || -1;

  return this.get(`/GetAreaShifts?rotaVersionId=${rotaVersionId}`);

}

getMatrixItems(periodGUIDs: string) : Promise<AssignedStaffResponse[] | null> {

  const rotaVersionId = this.getCurrentRota.get("rotaVersionId")?.value;

  return this.get(`/GetMatrix?rotaVersionId=${rotaVersionId}&rotationPeriodGUIDs=${periodGUIDs}`);

}

async loadMatrixForPeriods(periodGUIDs: string) {

  await this.getMatrixItems(periodGUIDs).then(async staffAssignments => {

    if(!staffAssignments){
      return;
    }
    
    for(let assignment of staffAssignments) {

      let user = this.userList.value.find(element => element.userId === assignment.userId);   
      
      this.addAssignedStaffControlToMatrix(assignment.areaShiftGUID, assignment.rotationPeriodGUID, user?.userId);
    }    
  
  });
 

}

async getLeavesForRotationPeriod(period: AbstractControl) : Promise<void> {

    let startDate = period.get('startDate')?.value;
    let endDate = period.get('endDate')?.value;

    let result = await this.get(`/GetLeavesForPeriod?startDate=${startDate}&endDate=${endDate}`) as RotationPeriodLeave[];

    //Let's make sure the list is unique
    result?.forEach(element => {

      if(!this.leaves.some(leave => leave.leaveRequestId === element.leaveRequestId)){
        this.leaves.push(element);
      }     
    });
  

}

shiftLeftRotation() : void {

  // if(this.periodCycleReset){
  //   this.periodCycleReset = false;
  //   this.offset = this.periodsToShow - 1;
  // }

  // if(this.getRotationPeriodArray.controls.length === this.periodsToShow){
  //   this.getRotationPeriodArray.controls.pop();   
  // }

  if(this.offset === 0){
    this.offset = this.periodsToShow - 1;
  }

  this.offset++;

  this.initialiseRotationPeriods(1);

  this.sortAreaShifts();

  setTimeout(() => this.generateTableDataSource(), 3000)
  
}

shiftRightRotation() : void {

  if(!this.periodCycleReset){
    this.periodCycleReset = true;
    this.offset -= (this.periodsToShow - 1);
  }

  if(this.getRotationPeriodArray.controls.length === this.periodsToShow){
    this.getRotationPeriodArray.controls.shift();   
  }

  this.offset--;

  this.initialiseRotationPeriods(1);
  
}

upsertAreaShift(areaShift: AreaShift) : Promise<AreaShiftResponse> {

  //See if we have any other shifts in the same area
  // let sameArea = this.getAreaShiftArray.controls.filter(element => element.get('rotationAreaId')?.value === areaShift.rotationAreaId);

  // areaShift.rotationAreaSortOrder = sameArea.length || 1;

  let areaShiftUpsert = areaShift.areaShiftId ? this.putSubEndpoint("AreaShift", areaShift) : this.postSubEndpoint("AreaShift", areaShift);

  areaShiftUpsert.then((result: AreaShiftResponse) => {

    if(result.success === 1){      

      areaShift.areaShiftId = result.areaShiftId;

      let item = this.getAreaShiftArray.controls.find(element => element.get('areaShiftGUID')?.value === areaShift.areaShiftGUID);

      item?.patchValue(areaShift);

      this.getAreaShiftArray.updateValueAndValidity();      
    }

  });

  return areaShiftUpsert;  

}

addRota() : void {

  this.resetRotaForm();

  this.getCurrentRota?.get('editingRota')?.setValue(true);
  this.getCurrentRota?.get('editingRotaVersion')?.setValue(true);
    
}

public setRotaVersionRotaId(rotaId: number) : void {

  let currentRota = this.rotas?.value.find(rota => rota.rotaId === rotaId);

  this.rotaVersions?.next(currentRota?.rotaVersions || []);

}

public setRotaAsDefault(defaultRotaId: number) : void {

  let currentRotas = this.rotas.value;

  currentRotas.forEach(rota => rota.defaultRota = rota.rotaId === defaultRotaId);

  this.rotas.next(currentRotas);

}

public setRotaVersionAsDefault(defaultRotaVersionId: number) : void {

  let currentRotaVersions = this.rotaVersions.value;

  currentRotaVersions.forEach(rotaVersion => rotaVersion.defaultRotaVersion = rotaVersion.rotaVersionId === defaultRotaVersionId);

  this.rotaVersions.next(currentRotaVersions);

}

public async upsertRota() : Promise<UpsertRotaResponse> {

  this.getCurrentRota.get('rotaVersionId')?.enable();

  let rota = this.getCurrentRota.value as CurrentRota;

  if(!rota.rotaId){
    rota.defaultRotaVersion = true;
  }

  if(this.rotas.value?.length === 0){
    rota.defaultRota = true;
  }
  
  //If we're setting to default, then unset the other defaults
  if(this.getCurrentRota.get('defaultRota')?.value){
    this.setRotaAsDefault(this.getCurrentRota.get('rotaId')?.value);
  }
  
  return this.post(rota).then((result: UpsertRotaResponse) => {

    let currentRotas = this.rotas.value;
    let currentRotaVersions = this.rotaVersions.value;

    let foundRotaIndex = currentRotas.findIndex(element => element.rotaId === rota.rotaId);
    let foundRotaVersionIndex = currentRotaVersions.findIndex(element => element.rotaVersionId === rota.rotaVersionId);

    if(result.rotaSuccess === 1 && result.rotaVersionSuccess === 1){

      this.getCurrentRota?.get('editingRota')?.setValue(false);        
      this.getCurrentRota?.get('editingRotaVersion')?.setValue(false);
      this.getCurrentRota.get('rotaId')?.setValue(result.rotaId);
      this.getCurrentRota.get('rotaVersionId')?.setValue(result.rotaVersionId);     

      rota.rotaId = result.rotaId;
      rota.rotaVersionId = result.rotaVersionId;

      this.updateRotasAndEmit(foundRotaIndex, rota, currentRotas);
      this.updateRotaVersionsAndEmit(foundRotaVersionIndex, rota, currentRotaVersions);
    }
    else {
      this.getCurrentRota.get('rotaVersionId')?.disable();
      this.getCurrentRota?.get('editingRota')?.setValue(true);
      this.getCurrentRota?.get('editingRotaVersion')?.setValue(true);
    }

    return result;
  });

}

private updateRotaVersionsAndEmit(foundIndex: number, rota: CurrentRota, currentRotaVersions: RotaVersion[]) : void {

  if(rota.rotaDeleted){
    this.rotaVersions.next([]);
    return;
  }

  if (foundIndex === -1) {

    let currentRota = this.getRotaFromCurrentRota(rota);

    currentRotaVersions.push(currentRota.rotaVersions[0]);
  }
  else {

    let updateVersion = currentRotaVersions[foundIndex];

    updateVersion.rotaVersionName = rota.rotaVersionName || "";
    updateVersion.defaultRotaVersion = rota.defaultRotaVersion || false;

    if(rota.rotaVersionDeleted){
      currentRotaVersions.splice(foundIndex, 1);

      //Let's check if there's only one rota version left. If there is, let's make it the default.      
      if(currentRotaVersions.length === 1){
        currentRotaVersions[0].defaultRotaVersion = true;
        this.saveRotaVersion(currentRotaVersions[0]);
      }
    }
    else {
      currentRotaVersions.splice(foundIndex, 1, updateVersion);
    }


  }

  this.rotaVersions.next(currentRotaVersions);

}

  private updateRotasAndEmit(foundIndex: number, rota: CurrentRota, currentRotas: Rota[]) : void {

    if (foundIndex === -1) {
      currentRotas.push(this.getRotaFromCurrentRota(rota));
    }
    else {

      let updateRota = currentRotas[foundIndex];

      updateRota.rotaName = rota.rotaName || "";
      updateRota.defaultRota = rota.defaultRota || false;

      if (rota.rotaDeleted) {
        currentRotas.splice(foundIndex, 1);
        this.getCurrentRota.reset();
      }

      else {
        currentRotas.splice(foundIndex, 1, updateRota);
      }

    }

    this.rotas.next(currentRotas);
  }

getRotaFromCurrentRota(rota: CurrentRota) : Rota {

  const newRota:Rota  = {
    rotaId: rota.rotaId || -1,
    rotaName: rota.rotaName || "",
    defaultRota: true,
    rotaDeleted: false,
    rotaVersions: [{
        rotaId: rota.rotaId || -1,
        rotaVersionId: rota.rotaVersionId || -1,
        rotaVersionName: rota.rotaVersionName || "",
        defaultRotaVersion: true,
        rotaVersionDeleted: false
      }]
  };
  
  return newRota;

}

public async saveRotaVersion(rotaVersion: RotaVersion) : Promise<UpsertRotaResponse> {

  let returnRotaVersion = {} as UpsertRotaResponse;

  returnRotaVersion.rotaVersionSuccess = -1;

  return this.putSubEndpoint("RotaVersion",rotaVersion).then(response => {

      if(response.success === 1){

        const versions = this.rotaVersions.value;

        const currentVersion = versions.find(element => element.rotaVersionId === rotaVersion.rotaVersionId);

        if(currentVersion){
          currentVersion.rotaVersionName = rotaVersion.rotaVersionName;
        }
        else {
          const newRota = {
            rotaId: rotaVersion.rotaId,   
            rotaVersionId: response.rotaVersionId,
            rotaVersionName: rotaVersion.rotaVersionName,
            defaultRotaVersion: rotaVersion.defaultRotaVersion,
            rotaVersionDeleted: false
          }

          versions.push(newRota);

        }

        if(rotaVersion.defaultRotaVersion){
          this.setRotaVersionAsDefault(response.rotaVersionId);
        }

        this.rotaVersions.next(versions);

        if(rotaVersion.rotaVersionDeleted){

          const removeIndex = versions.findIndex(element => element.rotaVersionId === rotaVersion.rotaVersionId);
          versions.splice(removeIndex, 1);

          if(versions.length === 1){
            versions[0].defaultRotaVersion = true;
            this.saveRotaVersion(versions[0]);
          }
    
        }

        this.getCurrentRota.get('editingRotaVersion')?.setValue(false);        
        this.getCurrentRota.get('rotaVersionId')?.setValue(response.rotaVersionId);

        returnRotaVersion = {
          rotaId: rotaVersion.rotaId,
          rotaVersionId: response.rotaVersionId,
          rotaSuccess: 1,
          rotaVersionSuccess: 1
        };
        
        return returnRotaVersion;

      }
      
      return returnRotaVersion;

    });

  }

  addAreaShift(areaShift: AreaShift | undefined, updateMatrix: boolean){    

    let defaultAreaShift = this.generateDefaultAreaShift();

    const areaShiftCount = this.getAreaShiftArray.length;

    if(areaShift){
      defaultAreaShift.patchValue(areaShift);
    }

    this.getAreaShiftArray.push(defaultAreaShift);

    if(updateMatrix){
      this.insertMatrixItemsForNewAreaShift(defaultAreaShift);
    }

    let row = this.generateDataSourceRow(defaultAreaShift);

    let currentRows = this.dataSource.value;
    currentRows.push(row);

    this.dataSource.next(currentRows);

    if(areaShiftCount === 0){
      this.upsertAreaShift(defaultAreaShift.value);
    }

  }

  async addRotationPeriod(rotationPeriod: RotationPeriod | undefined, updateMatrix: boolean, markAsDirty: boolean) : Promise<string> {

    let defaultRotationPeriod = this.generateDefaultRotationPeriod();

    if(!rotationPeriod && this.getRotationPeriodArray.controls.length === 0){
      this.addAreaShift(undefined, false);
    }

    if(markAsDirty){
      defaultRotationPeriod.markAsDirty();
    }

    if(rotationPeriod){

      defaultRotationPeriod.patchValue(rotationPeriod);

    }    
    
    await this.getLeavesForRotationPeriod(defaultRotationPeriod);

    this.getRotationPeriodArray.push(defaultRotationPeriod);

    defaultRotationPeriod.get("startDate")?.setValidators(Validators.required);
    defaultRotationPeriod.get("startDate")?.setAsyncValidators(this.rotationPeriodValidator.checkDateNotInExistingRange(defaultRotationPeriod.get('rotationPeriodGUID')?.value, this.getRotationPeriodArray));
    defaultRotationPeriod.get("startDate")?.updateValueAndValidity();
    defaultRotationPeriod.get("endDate")?.setValidators(Validators.required);
    defaultRotationPeriod.get("endDate")?.setAsyncValidators(this.rotationPeriodValidator.checkDateNotInExistingRange(defaultRotationPeriod.get('rotationPeriodGUID')?.value, this.getRotationPeriodArray));
    defaultRotationPeriod.get("endDate")?.updateValueAndValidity();


    this.getRotationPeriodArray.controls.sort((a,b) => new Date(a.get("startDate")?.value) < new Date(b.get("startDate")?.value) ? -1 : 1);

    if(!defaultRotationPeriod?.get('rotationPeriodId')?.value && defaultRotationPeriod.valid){

      let saveResult = await this.saveRotationPeriod(defaultRotationPeriod.value);

      defaultRotationPeriod.get('rotationPeriodId')?.setValue(saveResult.rotationPeriodId);

    }
    else if(!rotationPeriod?.rotationPeriodId){
      defaultRotationPeriod.markAsDirty();
    }

    if(updateMatrix){      
      this.insertMatrixItemsForNewRotation(defaultRotationPeriod);
    }

    return defaultRotationPeriod.get('rotationPeriodGUID')?.value;

  }

  private insertMatrixItemsForNewRotation(newRotationPeriod: FormGroup) : void {

    for(let areaShift of this.getAreaShiftArray.controls){
      this.addAssignedStaffControlToMatrix(areaShift.get('areaShiftGUID')?.value,newRotationPeriod.get('rotationPeriodGUID')?.value, undefined);
    }

  }

  private insertMatrixItemsForNewAreaShift(newAreaShift: FormGroup) : void {

    for(let rotationPeriod of this.getRotationPeriodArray.controls){
      this.addAssignedStaffControlToMatrix(newAreaShift.get('areaShiftGUID')?.value,rotationPeriod.get('rotationPeriodGUID')?.value, undefined);
    }

  }

  public generateDefaultRotationPeriod() : FormGroup {

    let lastRecord: AbstractControl;
    let maxSequence = 0;
    let nextStartDate = new Date();
    let nextEndDate = new Date();
    nextEndDate.setUTCDate(nextEndDate.getUTCDate() + 6);

    if(this.getRotationPeriodArray.controls.length > 0){
      lastRecord = this.getRotationPeriodArray.controls.reduce((a,b) => a.value.endDate < b.value.endDate ? b : a);
      maxSequence = lastRecord?.value?.sortOrder + 1;

      //We need to make the start date of the new period 1 day after the end date of the previous period
      nextStartDate = new Date(lastRecord.get('endDate')?.value);
      nextStartDate.setUTCDate(nextStartDate.getUTCDate() + 1);

      nextEndDate = new Date(lastRecord.get('endDate')?.value);
      nextEndDate.setUTCDate(nextEndDate.getUTCDate() + 7);
    }   

    const periodGUID = generateUUID();

    let retVal = this.fb.group({
      rotationPeriodId: [],
      rotationPeriodGUID: periodGUID,
      rotaVersionId: this.getCurrentRota.get("rotaVersionId")?.value,
      sortOrder: maxSequence,
      isDeleted: false,
      name: "",
      startDate: nextStartDate.toISOString().slice(0, 10),
      endDate: nextEndDate.toISOString().slice(0, 10),
      locked: false,
      editable: true,
      checkUnassigned: false});

      return retVal;

  }

  saveRotationPeriod(rotationPeriod: RotationPeriod) : Promise<RotationPeriodSaveResponse> {

    return rotationPeriod.rotationPeriodId ? this.postSubEndpoint("RotationPeriod",rotationPeriod) : this.putSubEndpoint("RotationPeriod",rotationPeriod);

  }

  upsertMatrix(rotationPeriodGUID:string) : void{

    const assignedStaff = this.getStaffAssignmentsForRotationPeriod(rotationPeriodGUID);

    for(let staff of assignedStaff){

      let assignedUser = {
        rotationPeriodGUID: staff.staffTaskId.split("|")[1],
        areaShiftGUID: staff.staffTaskId.split("|")[0],
        rotaVersionId: this.getCurrentRota.get("rotaVersionId")?.value,
        userId: staff.userId
      }

      this.putSubEndpoint("UpsertMatrix",assignedUser).then(result => {

        if(result.success=== -1){
          this.snackbar.errorSnackBar("An error occurred saving the assigned user", "OK");
        }

    });

    }

  }

  public getStaffAssignmentsForRotationPeriod(rotationPeriodGUID: string) : AssignedUser[] {

    return this.filterStaffAssignments(rotationPeriodGUID, 1)
    .map(element => (
        {          
          staffTaskId: this.getMatrix.get(element)?.get("staffTaskId")?.value || "",
          userId: this.getMatrix.get(element)?.get("userId")?.value || -1
        }
      ));
  }

  public generateDefaultAreaShift() : FormGroup {

    return this.fb.group({
                          areaShiftId: null,
                          areaShiftGUID: generateUUID(),
                          rotaVersionId: this.getCurrentRota.get("rotaVersionId")?.value || -1,
                          sequence: (this.getAreaShiftArray?.length) + 1,
                          rotationRoleId: [, Validators.required],
                          roleName: "",
                          colour: "#ffffff",
                          isDeleted: false,
                          rotationAreaSortOrder: 999,
                          areaRowSpan: 1,
                          rotationArea: "",
                          rotationAreaColour: "#ffffff",
                          rotationAreaId: ""
                        });
  }




  addAssignedStaffControlToMatrix(areaShiftGUID: string, rotationPeriodGUID: string, userId?: number){

    let staffTaskId = this.getCoords(areaShiftGUID, rotationPeriodGUID);

    const period = this.getRotationPeriodArray.controls.find(period => period.get("rotationPeriodGUID")?.value === rotationPeriodGUID);

    let leave = undefined;    

      let foundLeaveRaw = this.leaves.find(leave =>  leave.userId === userId &&
                                            leave.startDate <= period?.get("endDate")?.value &&
                                            leave.endDate >= period?.get("startDate")?.value);                                            

      if(foundLeaveRaw){  
        //We need to create a deep clone otherwise the leave gets updated by subsequent runs        
        leave = JSON.parse(JSON.stringify(foundLeaveRaw));

        leave.fullOverlap =  leave.startDate <= period?.get("startDate")?.value &&
                                  leave.endDate >= period?.get("endDate")?.value; 
        
      }

    if(!this.getMatrix.get(staffTaskId)){

      const addedTaskDetails = this.fb.group({
        staffTaskId,
        userId,
        leave
      });

      this.getMatrix.addControl(staffTaskId, addedTaskDetails, {emitEvent: false});
    }
    else {
      this.getMatrix.get(staffTaskId)?.get('userId')?.setValue(userId, {emitEvent: false});
      this.getMatrix.get(staffTaskId)?.get('leave')?.setValue(leave, {emitEvent: false});
    }

  }

  public async checkForLeave(rotationPeriodGUID: string, areaShiftGUID: string, assignedUserId: number) {

    let period = this.getRotationPeriodArray.controls.find(rotationPeriod => rotationPeriod.get('rotationPeriodGUID')?.value === rotationPeriodGUID);

      const rawLeave = this.leaves.find(leave => leave.userId === assignedUserId &&
                                          leave.endDate >= period?.get("startDate")?.value &&
                                          leave.startDate <= period?.get("endDate")?.value);

      let leave = undefined;

      if(rawLeave){

        leave = JSON.parse(JSON.stringify(rawLeave));

        const fullOverlap = leave?.startDate <= period?.get("startDate")?.value &&
                            leave?.endDate >= period?.get("endDate")?.value

        leave.fullOverlap = fullOverlap;

      }

      this.getMatrix.get(this.getCoords(areaShiftGUID, rotationPeriodGUID))?.get("leave")?.setValue(leave);

  }

  updateUnassignedStaffList() : void {

    this.ngUnsubscribeFromMatrixChanges.next();

    const periodsToCheck = this.getRotationPeriodArray.controls.map(period => {

                                    if(period.get('checkUnassigned')?.value === true){
                                      return period.get('rotationPeriodGUID')?.value;
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

      const unassigned = this.userList.value.filter(user => {

        for(const staff of assignedStaff){

          const currentStaff = this.getMatrix.get(staff)?.get("assignedUser")?.value?.userId as number | null;

          if(user.userId === currentStaff){
            return false;
          }

        }

        return true;

      });

      this.unassignedUsers.next(unassigned);

    }


    }

  getCoords(areaShiftGUID: string, rotationPeriodGUID: string): string {
    return `${areaShiftGUID}|${rotationPeriodGUID}`
  }

  public filterStaffAssignments(filterValue: string, periodOrShift: number) : string[] {

    let staffAssignments = Object.keys(this.getMatrix.controls);

    if(!staffAssignments){
      return [];
    }

    //We use includes because the filterValue could be multiple comma separated ids.
    staffAssignments = staffAssignments?.filter(assignment => filterValue.includes(assignment.split('|')[periodOrShift]));

    return staffAssignments;
  }

  async deleteAreaShift(areaShift: AbstractControl) : Promise<AreaShiftResponse> {

    areaShift.get('isDeleted')?.setValue(true);

    return this.upsertAreaShift(areaShift.value).then(result => {

      if(result.success === 1){
        const index = this.getAreaShiftArray.controls.findIndex(element => element?.get('areaShiftId')?.value === areaShift.get('areaShiftId')?.value );
    
        this.getAreaShiftArray.removeAt(index);
        this.sortAreaShifts();
      }

      return result;

    });
    

  }

  public sortAreaShifts() : void {

    this.getAreaShiftArray.controls.sort((a,b) => (a.get('sortOrder')?.value || 0) - (b.get('sortOrder')?.value || 0));

    this.resequenceAreaShifts();

    this.generateTableDataSource();

  }



  resequenceAreaShifts() : void {

    // let areaMap = this.getAreaCounts();

    // let currentAreaMap = new Map<string, boolean>();

    const controls = this.getAreaShiftArray.controls;

    if(controls?.length === 0) return;

    if(controls?.length === 1){
      controls.at(0)?.get('areaRowSpan')?.setValue(1);
      return;
    }

    let currentSpan = 1;
    let currentControl = controls.at(0);


    //We're not 0 or 1 length, so we actually have to figure out the row spans.
    //First we start by keeping a record of the first row (currentControl) in the table.
    //Then we check the 2nd row to see if the area matches the first. If it
    //does, we set the areaRowSpan of the second row to 0 and check the next row.
    //When the area changes we set the areaRowSpan of currentControl to the current rowspan count
    //and reset the rowspan counter.

    //We want the rowspan of the first row in the run to be the count of the matching rows below,
    //and the rest to be 0. Then the table will know how many cells in the Area Name column need to merge together

    /**
     * A - 3
     * A - 0
     * A - 0
     * B - 2
     * B - 0
     * C - 1
     * D - 2
     * D - 0 
     */
    for(let i = 1; i <= controls?.length; i++){

      if(currentControl?.get('rotationAreaId')?.value === controls.at(i)?.get('rotationAreaId')?.value){
        controls.at(i)?.get('areaRowSpan')?.setValue(0);  
        currentSpan++;
      }
      else {
        currentControl?.get('areaRowSpan')?.setValue(currentSpan);        
        currentSpan = 1;
        currentControl = controls.at(i);
      }


    }

  }

  resetRotaForm() : void {

    this.rotaForm.reset();  

    this.initialiseArrays();

  }

  public updateRotationPeriodLocked(rotationPeriodId: number, locked: boolean) : void {

    this.getRotationPeriodArray.controls.some(element => {

      if(element.get('rotationPeriodId')?.value === rotationPeriodId){
        element.get('locked')?.setValue(locked);
        this.generateTableDataSource();
        return true;
      }

      return false;

    });    

  }

  public insertRotaDayAssignments(period: AbstractControl) : Promise<SuccessOnlyResponse> {

    let rotationPeriodIdObject = { rotationPeriodId : period.get('rotationPeriodId')?.value };

    return this.postSubEndpoint("RotaDayAssignments", rotationPeriodIdObject);

  }

  public insertRotaDayAuthorisation(period: AbstractControl) : Promise<SuccessOnlyResponse> {

    let rotationPeriodIdObject = { rotationPeriodId : period.get('rotationPeriodId')?.value };

    return this.postSubEndpoint("RotaDayAuthorisation", rotationPeriodIdObject);

  }

  public getRotaDayAssignmentsByRotationPeriodId(rotationPeriodId: number) : void {

    this.get(`/GetRotaDayAssignmentsByRotationPeriodId?rotationPeriodId=${rotationPeriodId}`)
                  .then(result => result as RotaDayAssignmentResponse)                  
                  .then(rotaDays => this.rotaDays$.next(rotaDays));

  }

  public getRotaDayAssignmentsForDay(day: string) : Observable<RotaDay | undefined> {

    return this.rotaDays$.pipe(map(rawValue => rawValue?.rotaDays.find(rotaDay => rotaDay.rotaDayDate === day)))

  }

  public moveAreaShift(from: number, to:number) : void {

    moveItemInArray(this.getAreaShiftArray.controls, from, to);

    this.getAreaShiftArray.controls.forEach((element, index) => {

      element.get("sequence")?.setValue(index + 1);

      this.upsertAreaShift(element?.value).then(result => {

        if(result.success === -1){
          this.snackbar.errorSnackBar("An error has occurred when attempting to re-order the roles","OK");
        }

      });

    });


    this.sortAreaShifts();
  }

}
