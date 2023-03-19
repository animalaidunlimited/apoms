import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, UntypedFormGroup } from '@angular/forms';
import { ModelFormGroup } from 'src/app/core/helpers/form-model';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
import { AreaPositionWeekly, RotaDay, RotaDayAssignment, RotaDayAssignmentResponse, ScheduleAuthorisation, ScheduleManagerAuthorisation } from 'src/app/core/models/rota';
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

sortAssignments(a: AbstractControl, b: AbstractControl) : number {

    if(a.get('sequence')?.value === b.get('sequence')?.value){

      return a.get('employeeNumber')?.value?.localeCompare(b.get('employeeNumber')?.value,
        undefined,
        {numeric : true, sensitivity: 'base'}
      );
    }

    return a.get('sequence')?.value - b.get('sequence')?.value;

}

reassignAreaRowSpans(assignments: AbstractControl[]) : AbstractControl[] {

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

generateWeeklyDataSource(rotaDays : RotaDay[]) : FormArray{

  //Get a list of the distinct tasks
  const areaPositions = this.extractAreaPositionList(rotaDays);

  //Get a list of the days
  const days = this.extractDaysFromRotaDaysArray(rotaDays);

  //This needs to work like a matrix as the Rotation works as there may be days when a particular task
  //doesn't exist. So the front end will need to use the combo of areaPositionId and RotaDayDate to get the correct value
  //So we need to turn the rota day list into just a list of the assignments with an ID to pull them out
  let rawDataSource = this.generateDataSource(areaPositions, days, rotaDays);

  let sortedDataSource = rawDataSource.controls.sort(this.sortAssignments);

  console.log(sortedDataSource);

  let rowSpanDataSource = this.reassignAreaRowSpans(sortedDataSource);

  const returnArray: FormArray = new FormArray(rowSpanDataSource);

  return returnArray;

}

reassignWeeklyAreaRowSpans(rawDataSource: FormArray) : FormArray {
    
    rawDataSource.controls.forEach(element => {

      console.log(element.value);

    })
    
    return rawDataSource;

}

generateDataSource(areaPositions: AreaPositionWeekly[], days: (string | Date)[], rotaDays: RotaDay[]) : FormArray {

let dataSource: FormArray = new FormArray([] as any[]);

console.log(areaPositions);

areaPositions.forEach(position => {

  for(let i = 0; i < position.rotationAreaPositionCount; i++){

    let positionGroup = new UntypedFormGroup({
      rotationAreaPositionId: new FormControl<number|null>(position.rotationAreaPositionId),
      rotationAreaPosition: new FormControl<string|null>(position.rotationAreaPosition),
      rotationAreaId: new FormControl<number|null>(position.rotationAreaId),
      rotationArea: new FormControl<string|null>(position.rotationArea),
      rotationAreaColour: new FormControl<string|null>(position.rotationAreaColour),
      rotationAreaFontColour: new FormControl<string|null>(position.rotationAreaFontColour),
      sequence: new FormControl<number|null>(position.sequence),
      areaRowSpan: new FormControl<number|null>(1)
    });

    days.forEach(day => {

      const currentDayAssignments = rotaDays.find(currentDay => currentDay.rotaDayDate === day);
  
      const foundAssignments = currentDayAssignments?.rotaDayAssignments.filter(assignment => assignment.rotationAreaPositionId === position.rotationAreaPositionId) || [];
    
      let formGroup = this.generateNewAssignment(foundAssignments[i]);

      positionGroup.addControl(day.toString(), formGroup, { emitEvent: false });      
  
    });

    dataSource.push(positionGroup);

  }

});

return dataSource;

}

/**
 * Extracts a list of area positions from the total list by going through each day in the incoming array
 * and finding the day with the largest number of each area position. For instance, Sunday might have the most 
 * 'Fixed offs' so we need to use this to ensure that the weekly view will show all of the fixed offs.
 * @param rotaDays - The list of rotaDay object that will be iterated over
 * @returns An array of area position objects with all the information required for the front end display.
**/
public extractAreaPositionList(rotaDays: RotaDay[]) : AreaPositionWeekly[]{

  let areaPositionList =  rotaDays.reduce((cumulativeAreaPositions, rotaDay) => {

    const currentAssignments = rotaDay.rotaDayAssignments
                                              .filter(assignment => assignment.rotationAreaPositionId >= -1) // exclude breaks
                                              .reduce((returnValue, currentTask) => {

      const foundTask = returnValue.find(task => task.rotationAreaPositionId === currentTask.rotationAreaPositionId);

      if(!foundTask){

        const newValue: AreaPositionWeekly = {
          rotationAreaPositionId: currentTask.rotationAreaPositionId,
          rotationAreaPosition: currentTask.rotationAreaPosition,
          rotationAreaId: currentTask.rotationAreaId,
          rotationArea: currentTask.rotationArea,
          rotationAreaColour: currentTask.rotationAreaColour,
          rotationAreaFontColour: currentTask.rotationAreaFontColour,
          sequence: currentTask.sequence,
          rotationAreaPositionCount: 1,
          rotaDayIdList: []
        }

        returnValue.push(newValue);
      }
      else {      
  
          foundTask.rotationAreaPositionCount++;

      }

      return returnValue

    }, [] as AreaPositionWeekly[]);


    const concatAssignments: AreaPositionWeekly[] = [...currentAssignments, ...cumulativeAreaPositions];

    const returnAssignments = concatAssignments.reduce((returnValue, current) => {

      let foundValue = returnValue.find(element => element.rotationAreaPositionId === current.rotationAreaPositionId);

      if(!foundValue){
        returnValue.push(current);
      }
      else {
        foundValue.rotationAreaPositionCount = foundValue.rotationAreaPositionCount < current.rotationAreaPositionCount ?  current.rotationAreaPositionCount : foundValue.rotationAreaPositionCount;
      }      

      return returnValue;        

    },[] as AreaPositionWeekly[])

    return returnAssignments;

  }, [] as AreaPositionWeekly[]);

  return areaPositionList.sort((a,b) => a.sequence - b.sequence);

}

extractDaysFromRotaDaysArray(rotaDays: RotaDay[]) : (string)[] {
  return rotaDays.map(rotaDay => rotaDay.rotaDayDate.toString());
}


}
