import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserActionService } from '../user-details/user-action.service';

@Injectable({
  providedIn: 'root'
})
export class EvaluatePermissionService {

  componentPermissionLayer!: number;

  permissionGivenToUser!: number[];

  constructor(private userService: UserActionService) { }

  public async permissionTrueOrFalse(componentPermissionArray: number[]){

     return await this.userService.getUserPermissions().then(userPermissions=> {
      
        if(componentPermissionArray?.length) {
          
          this.permissionGivenToUser = componentPermissionArray.filter((id)=>{ return userPermissions.indexOf(id) > -1 })

          if(this.permissionGivenToUser && this.permissionGivenToUser[0] % 2 === 0) {
            this.componentPermissionLayer = 2;
          }
          else {
            this.componentPermissionLayer = 1
          }

          return this.componentPermissionLayer;

        }
        else if (!componentPermissionArray?.length) {
          return this.componentPermissionLayer = 2
        }
        else {
          return  this.componentPermissionLayer
        }
      
    })

        
  }
}
