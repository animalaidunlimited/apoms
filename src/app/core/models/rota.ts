
export interface RotationRoleResponse{
    rotationRoleId: number;
    success: number;
  }

  export interface BaseRotationRole{
    rotationRoleId: number | undefined;
    rotationRole: string;
    rotationAreaId: number;
    startTime: string;
    endTime: string;
    colour: string;
    isDeleted: boolean;
    sortOrder: number;
  }

export interface RotationRole extends BaseRotationRole{
    rotationArea: string;
    rotationAreaColour: string;
    rotationAreaSortOrder: number;
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
  areaRowSpan: number;
  areaShiftGUID: string;
  areaShiftId: number;
  colour: string;
  rotaVersionId: number;
  rotationArea: string;
  rotationAreaColour: string;
  rotationAreaId: number;
  rotationAreaSortOrder: number;
  rotationRoleId: number;
  sortOrder: number;
  roleName: string;
  isDeleted: boolean;
  }

  export interface RotationAreaBase{
    rotationAreaId: number;
    rotationArea: string;
    rotationAreaSortOrder: number;
  }

  export interface RotationArea extends RotationAreaBase {
    areaRowSpan: number;
    rotationAreaColour: string;    
  }

  export interface RotationRoleResponse{
    rotationAreaId: number;
    success: number;
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
  rotaDayAssignments: RotaDayAssignment[]
}

export interface RotaDayAssignment{
  rotaDayId: number;
  areaRowSpan: number;
  areaShiftId: number;
  userId: number;
  rotationUserId: number;
  leaveRequestId: number;
  rotationRole: string;
  rotationAreaId: number;
  rotationArea: string;  
  rotationAreaColour: string;
  rotationAreaSortOrder: string;
  plannedShiftStartTime: string;
  plannedShiftEndTime: string;
  actualShiftStartTime: string;
  actualShiftEndTime: string;
  notes: string;
}
export interface RotationPeriodLeave {
  leaveRequestId: number;
  userId: number;
  granted: boolean;
  startDate: string | Date;
  endDate: string | Date;
  fullOverlap: boolean;
}