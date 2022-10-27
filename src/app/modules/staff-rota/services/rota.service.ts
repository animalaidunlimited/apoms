import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Observable, of, BehaviorSubject, Subject} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { generateUUID } from 'src/app/core/helpers/utils';
import { AreaShift, AreaShiftResponse, AssignedStaffResponse, AssignedUser, CurrentRota, Rota, RotaDayAssignmentResponse, RotationArea, RotationPeriod,
  RotationPeriodLeave, RotationPeriodResponse, RotaVersion } from 'src/app/core/models/rota';
import { UserDetails } from 'src/app/core/models/user';
import { APIService } from 'src/app/core/services/http/api.service';
import { OrganisationDetailsService } from 'src/app/core/services/organisation-details/organisation-details.service';
import { SuccessOnlyResponse } from './../../../core/models/responses';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';

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

  userList: UserDetails[] = [];

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
    private fb: FormBuilder,
    private snackbar: SnackbarService,
    private organisationDetails: OrganisationDetailsService) {
    super(http);

    this.organisationDetails.organisationDetail.subscribe(organisationSettings => {

      this.periodsToShow = organisationSettings.rotaDefaults.periodsToShow;

    });

    this.getCurrentRota.get("rotaId")?.valueChanges.subscribe(rotaId => {
        
      this.setRotaVersionRotaId(rotaId);        
    });  
    
  }

public checkDateNotInRange(date: Date | string) : Observable<SuccessOnlyResponse> {

  return of({success: 0});

}

public async initialiseRotas() : Promise<boolean> {

  let request = "/GetRotas";

  return this.get(request).then((response:any) => {

    if(!response){
      return false;
    }

    const rotaResponse: Rota[] = response;

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
    else {
      this.addRota();
    }

    return true;

  });
  
}

public async initialiseArrays(users: UserDetails[]) {

  this.userList = users;

  this.rotaForm.setControl('matrix', this.fb.group({}));
  this.getAreaShiftArray.clear({emitEvent: false});
  this.getRotationPeriodArray.clear({emitEvent: false});
  // this.displayColumns.next([]);

  //Set up some defaults so we're not empty
  await this.getAreaShifts().then(areaShifts => areaShifts?.sort((a,b) => a.sequence - b.sequence)
                                                           .forEach(areaShift => this.addAreaShift(areaShift, false)));  

  await this.initialiseRotationPeriods(this.periodsToShow);

}

public getPeriodByGUID(rotationPeriodGUID:string) : FormGroup {

  return this.getRotationPeriodArray.controls.find(element => element.value.rotationPeriodGUID === rotationPeriodGUID) as FormGroup || this.fb.group({});

}

public markPeriodAsDirty(rotationPeriodGUID: string) : void {
  this.getRotationPeriodArray.controls.find(element => element.value.rotationPeriodGUID === rotationPeriodGUID)?.markAsDirty();
}

public async generateTableDataSource() : Promise<void> {

  let dataSource: AbstractControl[] = [];

  for(let areaShift of this.getAreaShiftArray.controls){

    let row = this.fb.group({
      area: [this.extractAreaFromAreaShift(areaShift)],
      areaShift: areaShift
    });

    for(let period of this.getRotationPeriodArray.controls) {

      const areaShiftGUID = areaShift.get('areaShiftGUID')?.value;
      const rotationPeriodGUID = period.get('rotationPeriodGUID')?.value;

      let controlName = this.getCoords(areaShiftGUID, rotationPeriodGUID);

      let foundControl = this.getMatrix.get(controlName);

      if(!foundControl){
        this.addAssignedStaffControlToMatrix(areaShiftGUID, rotationPeriodGUID);
      }

      foundControl = this.getMatrix.get(controlName) as AbstractControl;

      row.addControl(controlName, foundControl, {emitEvent: false});

    }

    dataSource.push(row);

  }

  console.log(dataSource);

  this.dataSource.next(dataSource); 

}

public extractAreaFromAreaShift(areaShift:AbstractControl) : RotationArea {

  return {
    areaRowSpan: areaShift.get('areaRowSpan')?.value,
    rotationAreaColour: areaShift.get('rotationAreaColour')?.value,
    rotationAreaName: areaShift.get('rotationAreaName')?.value,
    rotationAreaId: areaShift.get('rotationAreaId')?.value,
    rotationAreaSequence: areaShift.get('rotationAreaSequence')?.value
  }
  
}


async initialiseRotationPeriods(periodsToShow: number) {

  await this.getRotationPeriods(periodsToShow).then(async periods => {

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

getRotationPeriods(periodsToShow: number) : Promise<RotationPeriodResponse | null> {

  const rotaVersionId = this.getCurrentRota.get("rotaVersionId")?.value;

  return this.get(`/GetRotationPeriods?rotaVersionId=${rotaVersionId}&limit=${periodsToShow}&offset=${this.offset}`);

}

getAreaShifts() : Promise<AreaShift[] | null> {

  const rotaVersionId = this.getCurrentRota.get("rotaVersionId")?.value;

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

      let user = this.userList.find(element => element.userId === assignment.assignedUserId);   
      
      this.addAssignedStaffControlToMatrix(assignment.areaShiftGUID, assignment.rotationPeriodGUID, user);
    }

    this.generateTableDataSource();
    
  
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

  this.offset++;

  this.initialiseRotationPeriods(1);
  
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

  let areaShiftUpsert = areaShift.areaShiftId ? this.putSubEndpoint("AreaShift", areaShift) : this.postSubEndpoint("AreaShift", areaShift)

  return areaShiftUpsert;  

}

addRota() : void {

  this.resetRotaForm();

  this.getCurrentRota?.get('editingRota')?.setValue(true);
  this.getCurrentRota?.get('editingRotaVersion')?.setValue(true);
    
}

public getRotas() : BehaviorSubject<Rota[]> | undefined {

  return this.rotas;

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

  let rota = this.getCurrentRota.value;


  if(!rota.rotaId){
    rota.defaultRotaVersion = true;
  }

  this.getCurrentRota.get('rotaVersionId')?.enable();
  
  //If we're setting to default, then unset the other defaults
  if(this.getCurrentRota.get('defaultRota')?.value){
    this.setRotaAsDefault(this.getCurrentRota.get('rotaId')?.value);
  }
  
  let upsertResponse = rota.rotaId ? this.put(rota) : this.post(rota);
  
  return upsertResponse.then((result: UpsertRotaResponse) => {

    let currentRotas = this.rotas.value;

    let foundIndex = currentRotas.findIndex(element => element.rotaId === rota.rotaId);

    if(result.rotaSuccess === 1 && result.rotaVersionSuccess === 1){

      this.getCurrentRota?.get('editingRota')?.setValue(false);        
      this.getCurrentRota?.get('editingRotaVersion')?.setValue(false);
      this.getCurrentRota.get('rotaId')?.setValue(result.rotaId);
      this.getCurrentRota.get('rotaVersionId')?.setValue(result.rotaVersionId);     

      rota.rotaId = result.rotaId;
      rota.rotaVersionId = result.rotaVersionId;

      if(foundIndex === -1){
        let currentRota = this.rotas.value;
        currentRota.push(this.getRotaFromCurrentRota(rota));
      }
      else {

        let updateRota = currentRotas[foundIndex];
        
        updateRota.rotaName = rota.rotaName || "";
        updateRota.defaultRota = rota.defaultRota || false;

        if(rota.rotaDeleted){
          currentRotas.splice(foundIndex, 1);
        }
        else
        {
          currentRotas.splice(foundIndex, 1, updateRota);
        }
        
      }

      this.rotas.next(currentRotas);
    }
    else {
      this.getCurrentRota.get('rotaVersionId')?.disable();
      this.getCurrentRota?.get('editingRota')?.setValue(true);
      this.getCurrentRota?.get('editingRotaVersion')?.setValue(true);
    }

    return result;
  });

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

    if(areaShift){
      defaultAreaShift.patchValue(areaShift);
    }

    this.getAreaShiftArray.push(defaultAreaShift);

    if(updateMatrix){
      this.insertMatrixItemsForNewAreaShift(defaultAreaShift);
    }

    this.generateTableDataSource();

  }

  async addRotationPeriod(rotationPeriod: RotationPeriod | undefined, updateMatrix: boolean, markAsDirty: boolean) : Promise<string> {

    let defaultRotationPeriod = this.generateDefaultRotationPeriod();

    if(markAsDirty){
      defaultRotationPeriod.markAsDirty();
    }

    if(rotationPeriod){
      defaultRotationPeriod.patchValue(rotationPeriod);
    }

    await this.getLeavesForRotationPeriod(defaultRotationPeriod);

    this.getRotationPeriodArray.push(defaultRotationPeriod);

    this.getRotationPeriodArray.controls.sort((a,b) => new Date(a.get("startDate")?.value) < new Date(b.get("startDate")?.value) ? -1 : 1);

    if(updateMatrix){      
      this.insertMatrixItemsForNewRotation(defaultRotationPeriod);
    }
    
    this.generateTableDataSource();

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

  private generateDefaultRotationPeriod() : FormGroup {

    let lastRecord: AbstractControl;
    let maxSequence = 0;
    let nextStartDate = new Date();
    let nextEndDate = new Date();

    if(this.getRotationPeriodArray.controls.length > 0){
      lastRecord = this.getRotationPeriodArray.controls.reduce((a,b) => a.value.endDate < b.value.endDate ? b : a);
      maxSequence = lastRecord?.value?.sequence + 1;

      nextStartDate = new Date(lastRecord.get('endDate')?.value);
      nextStartDate.setUTCDate(nextStartDate.getUTCDate() + 1);

      nextEndDate = new Date(lastRecord.get('endDate')?.value);
      nextEndDate.setUTCDate(nextEndDate.getUTCDate() + 7);
    }   

    return this.fb.group({
      rotationPeriodId: [],
      rotationPeriodGUID: generateUUID(),
      rotaVersionId: this.getCurrentRota.get("rotaVersionId")?.value,
      sequence: maxSequence,
      isDeleted: false,
      name: "",
      startDate: nextStartDate.toISOString().slice(0, 10),
      endDate: nextEndDate.toISOString().slice(0, 10),
      locked: false,
      editable: true,
      checkUnassigned: false});

  }

  saveRotationPeriod(rotationPeriod: RotationPeriod) : Promise<RotationPeriodResponse> {

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

      this.putSubEndpoint("UpsertMatrix",assignedUser).then(result =>

        console.log(result)

      )

    }


  }

  public getStaffAssignmentsForRotationPeriod(rotationPeriodGUID: string) : AssignedUser[] {

    return this.filterStaffAssignments(rotationPeriodGUID, 1)
    .map(element => (
        {          
          staffTaskId: this.getMatrix.get(element)?.get("staffTaskId")?.value || "",
          userId: this.getMatrix.get(element)?.get("assignedUser")?.value?.userId || -1
        }
      ));
  }

  private generateDefaultAreaShift() : FormGroup {

    return this.fb.group({
                          areaShiftId: null,
                          areaShiftGUID: generateUUID(),
                          rotaVersionId: this.getCurrentRota.get("rotaVersionId")?.value || -1,
                          sequence: (this.getAreaShiftArray?.length || -1) + 1,
                          rotationRoleId: [, Validators.required],
                          roleName: "",
                          colour: "#ffffff",
                          isDeleted: false,
                          rotationAreaSequence: 0,
                          areaRowSpan: 1,
                          rotationAreaName: "",
                          rotationAreaColour: "",
                          rotationAreaId: "",
                        });
  }




  addAssignedStaffControlToMatrix(areaShiftGUID: string, rotationPeriodGUID: string, assignedUser?: UserDetails){

    let staffTaskId = this.getCoords(areaShiftGUID, rotationPeriodGUID);

    const period = this.getRotationPeriodArray.controls.find(period => period.get("rotationPeriodGUID")?.value === rotationPeriodGUID);

    let leave = undefined;    

      let foundLeaveRaw = this.leaves.find(leave =>  leave.userId === assignedUser?.userId &&
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
        assignedUser,
        leave
      });

      this.getMatrix.addControl(staffTaskId, addedTaskDetails, {emitEvent: false});
    }
    else {
      this.getMatrix.get(staffTaskId)?.get('assignedUser')?.setValue(assignedUser, {emitEvent: false});
      this.getMatrix.get(staffTaskId)?.get('leave')?.setValue(leave, {emitEvent: false});
    }

  }

  public async checkForLeave(rotationPeriodGUID: string, areaShiftGUID: string, userToCheck: AbstractControl) {

    let user = userToCheck.value;

    let period = this.getRotationPeriodArray.controls.find(rotationPeriod => rotationPeriod.get('rotationPeriodGUID')?.value === rotationPeriodGUID);

      const rawLeave = this.leaves.find(leave => leave.userId === user.userId &&
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

        this.generateTableDataSource();
      }

      return result;

    });
    

  }

  resetRotaForm() : void {

    this.rotaForm.reset();  

    this.initialiseArrays(this.userList);

  }

  public insertRotaDayAssignments(period: AbstractControl) : Promise<SuccessOnlyResponse> {

    let rotationPeriodIdObject = { rotationPeriodId : period.get('rotationPeriodId')?.value };

    return this.postSubEndpoint("RotaDayAssignments", rotationPeriodIdObject);

  }

  public getRotaDayAssignmentsByRotationPeriodId(rotationPeriodId: number) : Promise<RotaDayAssignmentResponse | null>{

    return this.get(`/GetRotaDayAssignmentsByRotationPeriodId?rotationPeriodId=${rotationPeriodId}`);

  }

  public moveAreaShift(from: number, to:number) : void {

    moveItemInArray(this.getAreaShiftArray.controls, from, to);

    this.getAreaShiftArray.controls.forEach((element, index) => {

      element.get("sequence")?.setValue(index);

      this.upsertAreaShift(element?.value).then(result => {

        if(result.success === -1){
          this.snackbar.errorSnackBar("An error has occurred when attempting to re-order the roles","OK");
        }

      });

    });

    this.generateTableDataSource();
  }

}
