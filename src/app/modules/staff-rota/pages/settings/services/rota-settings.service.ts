import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { fnSortBySortOrderAndRotationPeriodSortOrder } from 'src/app/core/helpers/utils';
import { GroupedRotationAreaPosition, RotationArea, RotationAreaPosition, RotationAreaPositionResponse, RotationAreaResponse, RotationRole, RotationRoleResponse } from 'src/app/core/models/rota';
import { APIService } from 'src/app/core/services/http/api.service';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';

@Injectable({
  providedIn: 'root'
})
export class RotaSettingsService extends APIService {

  endpoint = 'Rota';

  rotationRoles$!: Observable<RotationRole[]>;
  rotationAreas$!: Observable<RotationArea[]>;

  rotationAreasUpdated = new BehaviorSubject<boolean>(false);

  constructor(
    http: HttpClient
  ) {
    super(http);
   }

   getRotationRoles(includeDeleted: boolean): Observable<RotationRole[]> {    
 
      const request = `/GetRotationRoles?includeDeleted=${includeDeleted}`;

      return this.getObservable(request).pipe(map((response: RotationRole[]) => response?.sort((a,b) => fnSortBySortOrderAndRotationPeriodSortOrder(a,b))));
      
}
  
  getRotationAreas(includeDeleted: boolean) : Observable<RotationArea[]> {

    const request = `/GetRotationAreas?includeDeleted=${includeDeleted}`;

    return this.getObservable(request).pipe(map((response: RotationArea[]) => response));    
  
  }

  getRotationAreaPositions(includeDeleted: boolean) : Observable<RotationAreaPosition[]> {

    const request = `/GetRotationAreaPositions?includeDeleted=${includeDeleted}`;

    return this.getObservable(request).pipe(map((response: RotationAreaPosition[]) => response));    
  
  }
  
  getGroupedRotationAreaPositions(includeDeleted: boolean) : Observable<GroupedRotationAreaPosition[]> {

    const request = `/GetRotationAreaPositions?includeDeleted=${includeDeleted}`;

    return this.getObservable(request).pipe(map((response: RotationAreaPosition[]) => 
      
      response.reduce((returnValue, current) => {    
  
        let foundAreaGroup = returnValue.find((element:GroupedRotationAreaPosition) => element.rotationAreaId === current.rotationAreaId);
        
        !foundAreaGroup ?
          returnValue.push({rotationArea: current.rotationArea, rotationAreaId: current.rotationAreaId, positions: [current]})
        :
          foundAreaGroup.positions.push(current);  
        
        return returnValue;
        
      },[] as GroupedRotationAreaPosition[])
    
    ));    
  
  }

  saveRotationRole(rotationRole: RotationRole) : Promise<RotationRoleResponse> {

    return this.postSubEndpoint(`RotationRole`, rotationRole);
    
  }
  
  saveRotationArea(rotationArea: RotationArea) : Promise<RotationAreaResponse> {

    return this.postSubEndpoint(`RotationArea`, rotationArea);
    
  }
  
  saveRotationAreaPosition(rotationAreaPosition: RotationAreaPosition) : Promise<RotationAreaPositionResponse> {

    return this.postSubEndpoint(`RotationAreaPosition`, rotationAreaPosition);
    
  }

  updateRotationAreas() : void {
    this.rotationAreasUpdated.next(true);
  }

}
