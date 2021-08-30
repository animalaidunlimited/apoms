import { LatLngLiteral } from './driver-view';
import { CallerDetails } from './emergency-record';

export interface OutstandingCaseResponse {
    outstandingActions : OutstandingCase[];
}

export interface OutstandingCase {
    actionStatus: number;
    actionStatusName: string;
    statusGroups: RescuerGroup[];
}


export interface OutstandingAssignment {
    actionStatusId: number;
    ambulanceAction: string;
    ambulanceAssignmentTime: Date;
    rescueAmbulanceId: number;
    releaseAmbulanceId: number | null;
    callDateTime: string | Date | undefined;
    callerDetails: CallerDetails[];
    emergencyCaseId: number;
    emergencyCode: string;
    emergencyCodeId?: number;
    emergencyNumber: number;
    latLngLiteral: LatLngLiteral;
    location: string;
    moved?:boolean | null;
    patients: ActionPatient[];
    releasePickupDate: string | null;
    releaseBeginDate?: string ;
    releaseEndDate?: string ;
    releaseDetailsId: number ;
    releaseType: string;
    releaseRequestDate?: string;
    rescueTime?:string;
    searchCandidate?: boolean;
}
export interface RescuerGroup {
    staff1: number;
    staff1Abbreviation: string;
    staff2: number;
    staff2Abbreviation: string;
    latestLocation: google.maps.LatLngLiteral | undefined;
    actions: ActionGroup[];
}

export interface ActionGroup {
    ambulanceAction: string;
    ambulanceAssignment: OutstandingAssignment[];
}


export interface ActionPatient{
    animalType: string | null;
    animalTypeId: number;
    animalSize: string | null;
    patientCallOutcomeId: number | null;
    patientId: number;
    patientStatusDate: string | null;
    patientStatusId: number;
    problems: string;
    tagNumber: string | null;
    mediaCount:number;
}

export interface UpdatedRescue {
    success: number;
    emergencyCaseId: number;
    staff1Id: number;
    staff1Abbreviation: string;
    staff2Id: number;
    staff2Abbreviation: string;
    actionStatus: number;
}

export interface UpdateResponse{
    success: number;
    socketEndPoint: string;
}
