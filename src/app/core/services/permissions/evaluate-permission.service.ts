import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { UserPermissions } from '../../models/permissions';
import { UserDetailsService } from '../user-details/user-details.service';

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

  public getPermissionsObject() : UserPermissions[] {

    return [
      {
        groupNameId:1,
        groupName: 'Emergency register',
        permissions: [{
          permissionId: 1,
          permissionType: 'Read'
        }, {
          permissionId : 2,
          permissionType: 'Write'
        }]
      },
      {
        groupNameId: 2,
        groupName: 'Hospital manager',
        permissions: [{
          permissionId: 3,
          permissionType: 'Read'
        }, {
          permissionId : 4,
          permissionType: 'Write'
        }]
      }
      ,{
        groupNameId: 3,
        groupName: 'Treatment list',
        permissions: [{
          permissionId: 7,
          permissionType: 'Read'
        }, {
          permissionId : 8,
          permissionType: 'Write'
        }]
      },
      {
        groupNameId: 4,
        groupName: 'StreetTreat',
        permissions: [{
          permissionId: 5,
          permissionType: 'Read'
        }, {
          permissionId : 6,
          permissionType: 'Write'
        }]
      },
      {
        groupNameId: 5,
        groupName: 'Vehicles',
        permissions: [{
          permissionId: 15,
          permissionType: 'Read'
        }, {
          permissionId : 16,
          permissionType: 'Write'
        }]
      },
      {
        groupNameId: 6,
        groupName: 'Driver view',
        permissions: [{
          permissionId: 13,
          permissionType: 'Read'
        }, {
          permissionId : 14,
          permissionType: 'Write'
        }]
      },
      {
        groupNameId: 7,
        groupName: 'Rota',
        permissions: [{
          permissionId: 17,
          permissionType: 'Read'
        }, {
          permissionId : 18,
          permissionType: 'Write'
        }]
      },
      {
        groupNameId: 8,
        groupName: 'Reporting',
        permissions: [{
          permissionId: 9,
          permissionType: 'Read'
        }, {
          permissionId : 10,
          permissionType: 'Write'
        }]
      },
      {
        groupNameId: 9,
        groupName: 'Settings',
        permissions: [{
          permissionId: 11,
          permissionType: 'Read'
        }, {
          permissionId : 12,
          permissionType: 'Write'
        }]
      }
    ];

  }
}
