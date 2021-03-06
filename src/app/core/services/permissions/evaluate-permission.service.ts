import { Injectable } from '@angular/core';
import { UserActionService } from '../user-details/user-action.service';

@Injectable({
  providedIn: 'root'
})
export class EvaluatePermissionService {

  constructor(private userService: UserActionService) { }

  public async permissionTrueOrFalse(componentPermissionArray: number[]){

     return await this.userService.getUserPermissions().then(userPermissions=> {
        if(componentPermissionArray?.length) {
          return userPermissions?.some((permissionId:number) => componentPermissionArray.includes(permissionId)); 

        }
        else if (!componentPermissionArray?.length) {
          return true;
        }
        else {
          return false;   
        }
      
    })

        
  }
}
