export interface UserPermissions {
    groupNameId: number;
    groupName: string;
    permissions: Permissions[];
  }
  
export interface Permissions {
    permissionId : number;
    permissionType: string;
  }