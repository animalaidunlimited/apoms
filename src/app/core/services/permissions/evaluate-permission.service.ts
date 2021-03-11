import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserActionService } from '../user-details/user-action.service';

@Injectable({
  providedIn: 'root'
})
export class EvaluatePermissionService {

  constructor(private userService: UserActionService) { }

  public async permissionTrueOrFalse(componentPermissionArray: number[]){

     return await this.userService.getUserPermissions().then(userPermissions=> {
      let userPermissionObject = {
        userPermissionBoolean: false,
        userPermissionArray: []
      };

        if(componentPermissionArray?.length) {
          
          userPermissionObject.userPermissionBoolean = userPermissions?.some((permissionId:number) => componentPermissionArray.includes(permissionId));
          userPermissionObject.userPermissionArray = userPermissions;
          return  userPermissionObject

        }
        else if (!componentPermissionArray?.length) {
          userPermissionObject.userPermissionBoolean = true;
          userPermissionObject.userPermissionArray = userPermissions;
          return  userPermissionObject
        }
        else {
          userPermissionObject.userPermissionBoolean = false;
          userPermissionObject.userPermissionArray = userPermissions;
          return  userPermissionObject
        }
      
    })

        
  }
}
