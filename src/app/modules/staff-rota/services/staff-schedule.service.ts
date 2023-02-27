import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { ModelFormGroup } from 'src/app/core/helpers/form-model';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
import { RotaDayAssignment, RotaDayAssignmentResponse, ScheduleAuthorisation, ScheduleManagerAuthorisation } from 'src/app/core/models/rota';
import { APIService } from 'src/app/core/services/http/api.service';
import { ScheduleAuthorisationDay } from './../../../core/models/rota';

@Injectable({
  providedIn: 'root'
})
export class StaffScheduleService extends APIService{

  endpoint = 'Rota';

constructor(
  http: HttpClient,
  private fb: FormBuilder
) {
  super(http);
 }

saveAssignment(rotaDayDate: string, rotationPeriodId: number, assignment: RotaDayAssignment) : Promise<SuccessOnlyResponse> {

  assignment.rotaDayDate = rotaDayDate;
  assignment.rotationPeriodId = rotationPeriodId;

  return assignment.rotaDayId === 0 ?
                              this.postSubEndpoint(`RotaDayAssignment`, assignment) :
                              this.putSubEndpoint(`RotaDayAssignment`, assignment);

}

getRotationPeriodForRotaVersion(rotaVersionId: number, limit?: number, offset?: number) : Promise<number | null> {

  limit = limit || 1;
  offset = offset || 0;

  return this.get(`GetRotationPeriods?rotaVersionId=${rotaVersionId}&limit=${limit}&offset=${offset}`);

}

public generateNewAssignment(assignment: RotaDayAssignment) : ModelFormGroup<RotaDayAssignment> {

  let emptyAssignment = this.emptyAssignment();

  emptyAssignment.patchValue(assignment);

  return emptyAssignment;

}

public emptyAssignment() : ModelFormGroup<RotaDayAssignment> {


  return this.fb.nonNullable.group({
    notes: [''],
    userId: [0],
    employeeNumber: [''],
    userCode: [''],
    isAdded: [false],
    leaveUser: [''],
    rotaDayId: [0],
    rotationAreaPositionId: [0],
    rotationAreaPosition: [''],
    rotationAreaId: [0],
    rotationArea: [''],    
    plannedRotationAreaPositionId: [0],
    plannedRotationAreaPosition: [''],
    plannedRotationAreaId: [0],
    plannedRotationArea: [''],
    nextDay: [false],
    leaveGranted: [''],
    actualEndTime: [''],
    plannedAreaId: [0],
    leaveRequestId: [0],
    plannedEndTime: [''],
    rotationUserId: [0],
    actualStartTime: [''],
    plannedStartTime: [''],
    areaRowSpan: [0],
    rotationAreaColour: [''],
    rotationAreaFontColour: [''],
    sequence: [0],
    guid: [''],
    shiftSegmentCount: [0]
  });

}

reassignAreaRowSpans(assignments: AbstractControl[]) : AbstractControl[] {

  assignments.sort((a,b) => {

    if(a.get('sequence')?.value === b.get('sequence')?.value){

      return a.get('employeeNumber')?.value?.localeCompare(b.get('employeeNumber')?.value,
        undefined,
        {numeric : true, sensitivity: 'base'}
      );
    }

    return a.get('sequence')?.value - b.get('sequence')?.value;

  })

  if(assignments?.length === 0) return [];

  if(assignments?.length === 1){
    assignments.at(0)?.get('areaRowSpan')?.setValue(1);
    assignments;
  }

  let currentSpan = 1;
  let currentControl = assignments.at(0);

  for(let i = 1; i <= assignments?.length; i++){

    let currentControlValue = currentControl?.get('rotationAreaId')?.value || currentControl?.get('plannedRotationAreaId')?.value;
    let thisControlValue = assignments.at(i)?.get('rotationAreaId')?.value || assignments.at(i)?.get('plannedRotationAreaId')?.value;

    if(currentControlValue === thisControlValue){
      assignments.at(i)?.get('areaRowSpan')?.setValue(0);  
      currentSpan++;
    }
    else {
      currentControl?.get('areaRowSpan')?.setValue(currentSpan);        
      currentSpan = 1;
      currentControl = assignments.at(i);
    }

  }

  return assignments;

}

getScheduleManagerAuthorisation(rotationPeriodId: number) : Promise<ScheduleManagerAuthorisation | null> {

  return this.get(`/GetScheduleAuthorisationByRotationPeriodId?rotationPeriodId=${rotationPeriodId}`);

}

public insertScheduleManagerAuthorisation(rotationPeriodId: number) : Promise<SuccessOnlyResponse> {

  let rotationPeriodIdObject = { rotationPeriodId : rotationPeriodId };

  return this.postSubEndpoint("ScheduleManagerAuthorisation", rotationPeriodIdObject);

}

public updateScheduleManagerAuthorisation(authorization: ScheduleAuthorisationDay) : Promise<SuccessOnlyResponse> {

  return this.putSubEndpoint("ScheduleManagerAuthorisation", authorization);

}

}
