export interface Role{
    roleId: number;
    role: string;
    color: string
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

export interface RotationPeriod{
  rotationPeriodId: string;
  rotationGUID: string;
  rotaVersionId: number;
  startDate: Date | string;
  endDate: Date | string;
}

export interface AreaShift{
  staffTaskId: string;
  rotationPeriodId: string;
  sequence: number;
  roleId: number;
  roleName: string;
  }

export interface RotationPeriodResponse {
  success: number;
  rotationPeriodId: number;
}