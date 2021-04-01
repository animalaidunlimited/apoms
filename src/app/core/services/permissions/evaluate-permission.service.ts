import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserActionService } from '../user-details/user-action.service';

@Injectable({
  providedIn: 'root'
})
export class EvaluatePermissionService {

  componentPermissionLayer!: number | undefined;

  permissionGivenToUser!: number[];

  constructor(private userService: UserActionService) { }

  public async permissionTrueOrFalse(componentPermissionArray: number[]){

     return await this.userService.getUserPermissions().then(userPermissions=> {

      if(!componentPermissionArray?.length) {
        this.componentPermissionLayer = 1;
      }
      
      if(componentPermissionArray?.length) {

        if(userPermissions) {
          
          this.permissionGivenToUser = componentPermissionArray.filter((id)=>{ return userPermissions.indexOf(id) > -1 })

        }
        
        if(this.permissionGivenToUser.length && this.permissionGivenToUser[0] % 2 === 0) {
          this.componentPermissionLayer = 2;
        }
        else if(this.permissionGivenToUser.length && this.permissionGivenToUser[0] % 2 !== 0) {
          this.componentPermissionLayer = 1
        }
        else {
          this.componentPermissionLayer = 0;
        }
      }

      return this.componentPermissionLayer;
      
    })

        
  }
}
