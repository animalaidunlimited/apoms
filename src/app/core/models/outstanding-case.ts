export interface OutstandingAssignment {
    releaseId: number;
    callerId: number;
    complainerNotes: string;
    complainerInformed: boolean;
    ambulanceAction: string;
    requestedUser: string;
    requestedDate: Date | undefined;
    pickupDate: Date | undefined;
    releaseTypeId: number;
    releaseBeginDate: Date | undefined;
    releaseEndDate: Date | undefined;
    latitude: number;
    location: string;
    latLngLiteral: google.maps.LatLngLiteral;
    longitude: number;
    staff1: number;
    staff2: number;
    ambulanceArrivalTime: string | Date;
    rescueTime: string | Date;
    callDateTime: string | Date;
    callerDetails: CallerDetails[];
    actionStatus: number;
    callOutcomeId: number;
    rescuer1Colour: string;
    rescuer2Colour: string;
    emergencyCaseId: number;
    emergencyCodeId: number;
    emergencyNumber: number;
    staff1Abbreviation: string;
    staff2Abbreviation: string;
    animalTypes: string;
    patients: number[];
    isLargeAnimal: boolean;
    moved?: boolean;
    searchCandidate?: boolean;
    mediaCount: number;
    patientId: number;
    tagNumber:string;
}

export interface CallerDetails {
    callerId: number;
    callerName: string;
    callerNumber: string;
}

export interface RescuerGroup {
    staff1: number;
    staff1Abbreviation: string;
    staff2: number;
    staff2Abbreviation: string;
    latestLocation: google.maps.LatLngLiteral | undefined;
    ambulanceAssignment: OutstandingAssignment[];
}

export interface OutstandingCase {
    actionStatus: number;
    actionStatusName: string;
    actionGroups: RescuerGroup[];
}

export interface OutstandingCaseResponse {
    outstandingActions : OutstandingCase[];
    // outstandingRescues: OutstandingCase[];
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
