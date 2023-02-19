
export interface RotationRoleResponse{
    rotationRoleId: number;
    success: number;
  }

  export interface ShiftSegmentType {
    segmentTypeId: number;
    segmentType: string;
  }

  export interface BaseShiftSegment{
    rotationRoleShiftSegmentId: number;
    shiftSegmentTypeId: number;    
    startTime: string;
    endTime: string;
    sameDay: boolean;    
  }


  export interface ShiftSegment extends BaseShiftSegment{
    rotationRoleShiftSegmentUUID: string;
    shiftSegmentTypeId: number;
    isDeleted: boolean;
  }

  export interface BaseRotationRole{
    rotationRoleId: number | undefined;
    rotationRole: string;
    shiftSegments: ShiftSegment[],
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
  rotationPeriodId: number;
  rotationPeriodGUID: string;
  rotaVersionId: number;
  startDate: Date | string;
  endDate: Date | string;
  name: string;
  locked: boolean;
}

export interface AreaShift{
  areaRowSpan: number;
  areaShiftGUID: string;
  areaShiftId: number;
  colour: string;
  rotaVersionId: number;
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
    scheduleManagerId: number;
    scheduleManager: string;
  }

  export interface RotationAreaPosition {
    rotationAreaPositionId: number;
    rotationAreaId: number;
    rotationArea: string;
    rotationAreaPosition: string;
    sortOrder: number;
    isDeleted: boolean;
    colour: string;
  }

  export interface GroupedRotationAreaPosition {
    rotationArea: string;
    rotationAreaId: number;
    positions: RotationAreaPosition[]
  }

  export interface RotationAreaResponse{
    rotationAreaId: number;
    success: number;
  }

  export interface RotationRoleResponse{
    rotationRoleId: number;
    rotationRoleSuccess: number;
    shiftSegments: RotationRoleShiftSegmentResponse[]
  }

  export interface RotationRoleShiftSegmentResponse {
    rotationRoleShiftSegmentUUID: string;
    rotationRoleShiftSegmentId: number;
    success: number
  }


export interface RotationPeriodSaveResponse {
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
  rotaId: number,
  rotaVersionId: number,
  rotationPeriodId: number;
  rotaDays: RotaDay[];
}

export interface RotaDay{
  rotaDayDate: Date | string;
  rotaDayAssignments: RotaDayAssignment[]
}

export interface UserAssignmentPrintItem {
  userId: number;
  employeeNumber: string;
  firstName: string;
  localName: string
  notes: string;
  startTime?: string;
  endTime?: string;
  rotationAreaPosition: string;
}

export interface RotaDayAssignment{
  notes: string;
  userId: number;
  employeeNumber: string;
  userCode: string;
  isAdded: boolean;
  leaveUser: string;
  rotaDayId: number;
  
  rotationAreaPositionId: number;
  rotationAreaPosition: string;
  rotationAreaId: number;
  rotationArea: string;    
  plannedRotationAreaPositionId: number;
  plannedRotationAreaPosition: string;
  plannedRotationAreaId: number;
  plannedRotationArea: string;

  leaveGranted: string;
  actualEndTime: string;
  plannedAreaId: number;
  leaveRequestId: number;
  plannedEndTime: string;
  rotationUserId: number;
  actualStartTime: string;
  plannedStartTime: string;
  areaRowSpan: number;
  rotationAreaColour: string;
  sequence: number;
  guid: string;
  rotaDayDate?: string;
  rotationPeriodId?: number;
  shiftSegmentCount: number;
}
export interface RotationPeriodLeave {
  leaveRequestId: number;
  userId: number;
  granted: boolean;
  startDate: string | Date;
  endDate: string | Date;
  fullOverlap: boolean;
}

export interface LastFestivalDetails {
  requestDate: string | Date | null;
  leaveStartDate: string | Date | null;
  leaveEndDate: string | Date | null;
  numberOfDays: number;
  granted: number | null;
  toolTip: string | null;
}

export interface LeaveRequest {
  leaveRequestId: number | null;  
  userId: number | null;
  requestDate: Date | null;
  leaveRequestReasonId: number | null;
  leaveRequestReason: string;
  additionalInformation: string;
  leaveStartDate: Date | string | null;
  leaveEndDate: Date | string | null;
  numberOfDays: number;
  granted: number | null;
  commentReasonManagementOnly: string;
  dateApprovedRejected: Date | null;
  recordedOnNoticeBoard: boolean | null;
  withinProtocol: boolean | null;
  festivalId: number | null;
  isDeleted: boolean;
  lastFestivalDetails: LastFestivalDetails | null
}

export interface DisplayLeaveRequest extends LeaveRequest {
department: string;
departmentId: number;
userCode: string;
departmentColour: string;
}

export interface LeaveRequestReason {
  leaveRequestReasonId: number;
  leaveRequestReason: string;
  sortOrder: number;
}

export interface LeaveRequestSaveResponse {
  leaveRequestId: number;
  success: number;
}

export interface Department {
  departmentId: number;
  department: string;
  colour: string;
  sortOrder: number;
}

export interface Festival {
  festivalId: number;
  festival: string;
  localName: string;
  noticeDaysRequired: number;
  sortOrder: number;
}

export interface LeaveRequestProtocol{
  sortOrder: number;
  dayRangeEnd: number;
  dayRangeStart: number;
  noticeDaysRequired: number;
}

export interface ScheduleAuthorisation
{
  scheduleManagerId: number;
  scheduleManager: string;
  areaList: string;
  authorised: boolean;
}

export interface ScheduleAuthorisationDay{
  rotaDayDate: string;
  rotaDayAuthorisationId: number;
  managerCount: number;
  authorisedCount: number;
  authorisation: ScheduleAuthorisation[];
}

export interface ScheduleManagerAuthorisation {
  rotationPeriodId: number;  
  scheduleAuthorisation: ScheduleAuthorisationDay[]
}