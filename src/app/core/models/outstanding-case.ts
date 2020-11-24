export interface OutstandingRescue {
    ambulanceAction: string;
    requestedUser: string;
    requestedDate: Date | undefined;
    releaseTypeId: number;
    releaser1Id:number;
    releaser2Id: number;
    releaseBeginDate: Date | undefined;
    releaseEndDate: Date | undefined; 
    latitude: number;
    location: string;
    latLngLiteral: google.maps.LatLngLiteral;
    longitude: number;
    callerName: string;
    rescuer1Id: number;
    rescuer2Id: number;
    ambulanceArrivalTime: string | Date;
    rescueTime: string | Date;
    callDateTime: string | Date;
    callerNumber: string;
    rescueStatus: number;
    callOutcomeId: number;
    rescuer1Colour: string;
    rescuer2Colour: string;
    emergencyCaseId: number;
    emergencyCodeId: number;
    emergencyNumber: number;
    rescuer1Abbreviation: string;
    rescuer2Abbreviation: string;
    animalTypes: string;
    patients: number[];
    isLargeAnimal: boolean;
    moved?: boolean;
    searchCandidate?: boolean;
}

export interface RescuerGroup {
    rescuer1: number;
    rescuer1Abbreviation: string;
    releaser1Abbreviation: string;
    releaser2Abbreviation: string;
    rescuer2: number;
    rescuer2Abbreviation: string;
    latestLocation: google.maps.LatLngLiteral | undefined;
    ambulanceAssignment: OutstandingRescue[];
}

export interface OutstandingCase {
    rescueReleaseStatus: number;
    rescueReleaseStatusName: string;
    rescueReleaseGroups: RescuerGroup[];
}

export interface OutstandingCaseResponse {
    outstandingRescueRelease : OutstandingCase[];
    // outstandingRescues: OutstandingCase[];
}

export interface UpdatedRescue {
    success: number;
    emergencyCaseId: number;
    rescuer1Id: number;
    rescuer1Abbreviation: string;
    rescuer2Id: number;
    rescuer2Abbreviation: string;
    rescueStatus: number;
}

export interface UpdateResponse{
    success: number;
    socketEndPoint: string;
}
