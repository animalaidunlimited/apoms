import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { fnSortBySortOrderAndRotationPeriodSortOrder } from 'src/app/core/helpers/utils';
import { RotationArea, RotationRole, RotationRoleResponse } from 'src/app/core/models/rota';
import { APIService } from 'src/app/core/services/http/api.service';

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

    if(!this.rotationRoles$){
      const request = `/GetRotationRoles?includeDeleted=${includeDeleted}`;

      this.rotationRoles$ = this.getObservable(request).pipe(map((response: RotationRole[]) => response.sort((a,b) => fnSortBySortOrderAndRotationPeriodSortOrder(a,b))));
      
    }
    
    return this.rotationRoles$;

}
  
  getRotationAreas(includeDeleted: boolean) : Observable<RotationArea[]> {

    const request = `/GetRotationAreas?includeDeleted=${includeDeleted}`;

    return this.getObservable(request).pipe(map((response: RotationArea[]) => response));    
  
  }

  saveRotationRole(rotationRole: RotationRole) : Promise<RotationRoleResponse> {

    return this.postSubEndpoint(`RotationRole`, rotationRole);
    
  }
  
  saveRotationArea(rotationArea: RotationArea) : Promise<RotationRoleResponse> {

    return this.postSubEndpoint(`RotationArea`, rotationArea);
    
  }

  updateRotationAreas() : void {
    this.rotationAreasUpdated.next(true);
  }

}
