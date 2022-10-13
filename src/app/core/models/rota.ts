export interface RotationRole{
    rotationRoleId: number;
    rotationRole: string;
    colour: string
  }

export interface RotationRoleDropdown{
    RotationRoleId: number;
    RotationRole: string;
    Colour: string;
    IsDeleted: boolean;
    SortOrder: number;
  }
  
export interface Rota{
    rotaId: number;
    rotaName: string;
    defaultRota: boolean;
    rotaDeleted: boolean;
    rotaVersions: RotaVersion[]
  }
  
export interface RotaVersion{
    rotaId: number;    
    rotaVersionId: number;
    rotaVersionName: string;
    defaultRotaVersion: boolean;
    rotaVersionDeleted: boolean;
  }

export interface CurrentRota {
    rotaId: number | undefined;
    rotaName: string | undefined;
    defaultRota: boolean | undefined;
    rotaVersionId: number | undefined;
    rotaVersionName: string | undefined;
    defaultRotaVersion: boolean | undefined;
    rotaDeleted: boolean | undefined;
    rotaVersionDeleted: boolean | undefined;
    editing: boolean;
}

//Keep these here for the moment because we'll use them when we upgrade to Angular 14
export interface StaffTask{
  staffTaskId: string;
  assignedUserId: number;
  employeeNumber: string;
  firstName: string;
}

export interface AssignedStaffResponse{
  rotationPeriodGUID: string;
  areaShiftGUID: string;
  assignedUserId: number;
}

export interface RotationPeriodResponse{
  firstRotationPeriodGUID: string,
  lastRotationPeriodGUID: string,
  rotationPeriods: RotationPeriod[]
}

export interface RotationPeriod{
  rotationPeriodId: string;
  rotationPeriodGUID: string;
  rotaVersionId: number;
  startDate: Date | string;
  endDate: Date | string;
  locked: boolean;
}

export interface AreaShift{
  areaShiftId: number;
  areaShiftGUID: string;
  sequence: number;
  rotationRoleId: number;
  roleName: string;
  isDeleted: boolean;
  }

export interface RotationPeriodResponse {
  success: number;
  rotationPeriodId: number;
}

export interface AreaShiftResponse{
  success: number;
  areaShiftId: number;
}

export interface AssignedUser {
  staffTaskId: string;
  userId: number;
}

export interface RotaDayAssignmentResponse {
  rotationPeriodId: number;
  rotaDays: RotaDay[];
}

export interface RotaDay{
  rotaDayDate: Date | string;
  rotaDayAssignment: RotaDayAssignment[]
}

export interface RotaDayAssignment{
  rotaDayId: number;
  areaShiftId: number;
  userId: number;
  rotationUserId: number;
  leaveRequestId: number;
}