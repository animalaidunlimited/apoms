import { Injectable } from '@angular/core';
import { UserDetailsService } from '../user-details/user-details.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EvaluatePermissionService {

  componentPermissionLayer!: number | undefined;

  permissionGivenToUser!: number[];

  constructor(private userService: UserDetailsService) { }

  public async permissionTrueOrFalse(componentPermissionArray: number[]) : Promise<number | undefined>{
    
      await this.userService.permissionCheckComplete.toPromise();

      return of(this.evaluatePermission(componentPermissionArray, this.userService.permissionArray.value)).toPromise();    

  }

  public evaluatePermission(componentPermissionArray: number[], userPermissions: number[]) : number | undefined {

    if (!componentPermissionArray?.length) {
      this.componentPermissionLayer = 1;
    }

    if (componentPermissionArray?.length) {

      if (userPermissions) {

        this.permissionGivenToUser = componentPermissionArray.filter((id) => { return userPermissions.indexOf(id) > -1; });

      }

      if (this.permissionGivenToUser.length && this.permissionGivenToUser[0] % 2 === 0) {
        this.componentPermissionLayer = 2;
      }
      else if (this.permissionGivenToUser.length && this.permissionGivenToUser[0] % 2 !== 0) {
        this.componentPermissionLayer = 1;
      }
      else {
        this.componentPermissionLayer = 0;
      }
    }
    return this.componentPermissionLayer;
  }
}
