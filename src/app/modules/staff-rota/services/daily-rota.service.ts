import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ModelFormGroup } from 'src/app/core/helpers/form-model';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
import { RotaDayAssignment } from 'src/app/core/models/rota';
import { APIService } from 'src/app/core/services/http/api.service';
import { BaseShiftSegment } from './../../../core/models/rota';

@Injectable({
  providedIn: 'root'
})
export class DailyRotaService extends APIService{

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

  return this.get(`GetRotationPeriods?rotaVersionId=${rotaVersionId}&limit=${limit}&offset=${offset}`)

}

public generateNewAssignment(assignment: RotaDayAssignment) : ModelFormGroup<RotaDayAssignment> {

  let emptyAssignment = this.emptyAssignment();

  emptyAssignment.patchValue(assignment);

  return emptyAssignment;

}

public emptyAssignment() : ModelFormGroup<RotaDayAssignment> {

  const blankSegment:BaseShiftSegment[] = [{
    rotationRoleShiftSegmentId: -1,
    shiftSegmentTypeId: -1,
    startTime: "",
    endTime: "",
    sameDay: false
  }];

  return this.fb.nonNullable.group({
    rotaDayId :                 [0],
    areaRowSpan :               [1],
    userId :                    [0],
    rotationUserId :            [0],
    leaveRequestId :            [0],
    leaveGranted :              [''],
    leaveUser :                 [''],
    rotationRoleId :            [0],
    rotationRole :              [''],
    rotationAreaId :            [0],
    rotationArea :              [''],
    rotationAreaColour :        [''],
    rotationAreaSortOrder :     [0],
    rotationRoleShiftSegments : [blankSegment],       
    notes :                     [''],
    isAdded:                    [true],
    guid:                       ['']
  });

}

}
