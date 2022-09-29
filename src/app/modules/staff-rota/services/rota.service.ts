import { HttpClient } from '@angular/common/http';
import { ThisReceiver } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Observable, of, BehaviorSubject} from 'rxjs';
import { generateUUID } from 'src/app/core/helpers/utils';
import { CurrentRota, Rota, RotationPeriod, RotationPeriodResponse, RotaVersion } from 'src/app/core/models/rota';
import { UserDetails } from 'src/app/core/models/user';
import { APIService } from 'src/app/core/services/http/api.service';
import { RotationPeriodValidator } from 'src/app/core/validators/rotation-period.validator';
import { SuccessOnlyResponse } from './../../../core/models/responses';

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

  endpoint = 'Rota';

  rotas:BehaviorSubject<Rota[]> = new BehaviorSubject<Rota[]>([]);
  rotaVersions:BehaviorSubject<RotaVersion[]> = new BehaviorSubject<RotaVersion[]>([]);

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

  public get getRotationPeriodArray() : FormArray {
    return this.rotaForm.get('rotationPeriodArray') as FormArray || this.fb.array([]);
  }

  public get getAreaShiftArray() : FormArray {
    return this.rotaForm.get('areaShiftArray') as FormArray || this.fb.array([]);
  }

  public get getMatrix() : FormGroup {
    return this.rotaForm.get('matrix') as FormGroup || this.fb.array([]);
  }

  public get getCurrentRota() : FormGroup {
    return this.rotaForm.get('currentRota') as FormGroup;
  }

  public get getRotaForm() : FormGroup {
    return this.rotaForm as FormGroup;
  }

  constructor(
    http: HttpClient,    
    private fb: FormBuilder) {
    super(http);

    this.getCurrentRota.get("rotaId")?.valueChanges.subscribe(rotaId => {
        
      this.setRotaVersionRotaId(rotaId);        
    });

  }

public checkDateNotInRange(date: Date | string) : Observable<{success: number}> {

  return of({success: 0});

}

public initialiseRotas() {

  let request = "/GetRotas";

  this.get(request).then((response:any) => {

    if(!response){
      return;
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

  });
  
}


public initialiseArrays() {

  this.getAreaShiftArray.clear();
  this.getRotationPeriodArray.clear();

  //Set up some defaults so we're not empty
  this.addAreaShift();
  this.addRotationPeriod(true);

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




   addAreaShift(){

    this.getAreaShiftArray.push(this.generateDefaultAreaShift());  
    this.updateMatrix();

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
      rotationPeriodId: [],
      rotationPeriodGUID: groupId,
      rotaVersionId: this.getCurrentRota.get("rotaVersionId")?.value,
      sequence: maxSequence,
      isDeleted: false,
      name: "",
      startDate: "",
      endDate: "",
      editable: true,
      checkUnassigned: false});

      return newGroup;

  }

  saveRotationPeriod(rotationPeriod: RotationPeriod) : Promise<RotationPeriodResponse> {

    return rotationPeriod.rotationPeriodId ? this.postSubEndpoint("RotationPeriod",rotationPeriod) : this.putSubEndpoint("RotationPeriod",rotationPeriod);

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

  private updateMatrix() : void {
      
    for(let shift of this.getAreaShiftArray.controls){

      for(let period of this.getRotationPeriodArray.controls){          

        this.addAssignedStaffControlToMatrix(shift.get('areaShiftId')?.value, period.get('rotationPeriodId')?.value);

      }
    }

}

addAssignedStaffControlToMatrix(areaShiftId: string, rotationPeriodId: string, assignedUser?: UserDetails){

  let staffTaskId = this.getCoords(areaShiftId, rotationPeriodId);

  const addedTaskDetails = this.fb.group({
    staffTaskId: staffTaskId,
    assignedUser: assignedUser});      

  if(!this.getMatrix.get(staffTaskId)){
    this.getMatrix.addControl(staffTaskId, addedTaskDetails);
  }


}

getCoords(areaShiftId: string, rotationPeriodId: string): string {
  return `${areaShiftId}|${rotationPeriodId}`
}

public filterStaffAssignments(filterValue: string, periodOrShift: number) : string[] {

  let staffAssignments = Object.keys(this.getMatrix.controls);

  //We use includes because the filterValue could be multiple comma separated ids.
  staffAssignments = staffAssignments.filter(assignment => filterValue.includes(assignment.split('|')[periodOrShift]));

  return staffAssignments;
}

deleteAreaShift(areaShift: AbstractControl) : void {

  const index = this.getAreaShiftArray.controls.findIndex(element => element?.get('areaShiftId')?.value === areaShift.get('areaShiftId')?.value );

  this.getAreaShiftArray.removeAt(index);
  

}

resetRotaForm() : void {

  this.rotaForm.reset();  

  this.initialiseArrays();

}

}
