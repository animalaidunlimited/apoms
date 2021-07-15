import { CallerDetails } from './emergency-record';

export interface OutstandingCaseResponse {
    outstandingActions : OutstandingCase[];
}

export interface OutstandingCase {
    actionStatus: number;
    actionStatusName: string;
    statusGroups: RescuerGroup[];
}


export interface OutstandingAssignment2 {
    actionStatusId: number;
    ambulanceAction: string;
    assignedVehicleId: number | null;
    callDateTime: string;
    callerDetails: [{
        callerId: number;
        callerName: string;
        callerNumber: string;
    }];
    emergencyCaseId: number;
    emergencyCode: string;
    emergencyCodeId: number;
    emergencyNumber: number;
    lat: number;
    lng: number;
    location: string;
    patients: [{
        animalType: string | null;
        animalTypeId: number;
        animalSize: string | null;
        patientCallOutcomeId: number | null;
        patientId: number;
        patientStatusDate: string | null;
        patientStatusId: -1
        problems: string;
        tagNumber: string | null;
    }];
    pickupDate: string | null;
    releaseBeginDate: string | null;
    releaseEndDate: string | null;
    releaseId: number | null;
    releaseType: string;
    requestedDate: string | null;
    rescueTime:string | null;
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

export interface OutstandingAssignment {
    staff1: number;
    staff2: number;
    callerId: number;
    location: string;
    patients: ActionPatient[];
    releaseId: number;
    callerName: string;
    pickupDate: string | Date;
    requestedDate: string | Date;
    rescueTime: string | Date;
    actionStatus: number;
    callDateTime: string | Date;
    callerDetails: CallerDetails[];
    callOutcomeId: number;
    latLngLiteral: google.maps.LatLngLiteral;
    releaseType: string;
    releaseEndDate: string | Date;
    ambulanceAction: string;
    emergencyCaseId: number;
    emergencyCodeId: number;
    emergencyCode: string;
    emergencyNumber: number;
    releaseBeginDate: string | Date;
    ambulanceArrivalTime: string | Date;

    // These are for updated cases coming in via the messaging service
    assignedVehicleId: number,
    ambulanceAssignmentTime: Date,
    staff1Abbreviation: string;
    staff2Abbreviation: string;
    staff1Colour: string;
    staff2Colour: string;
    moved?: boolean;
    searchCandidate?: boolean;
    filteredCandidate?: boolean;
}

export interface ActionPatient{
    patientId: number;
    tagNumber: string;
    animalType: string;
    mediaCount: number;
    largeAnimal: boolean;
    problems: string;
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
