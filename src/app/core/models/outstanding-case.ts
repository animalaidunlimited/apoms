export interface OutstandingRescue {
    latitude: number;
    location: string;
    latLngLiteral: google.maps.LatLngLiteral,
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
    rescuer2: number;
    rescuer2Abbreviation: string;
    latestLocation: google.maps.LatLngLiteral | undefined;
    rescues: OutstandingRescue[];
}

export interface OutstandingCase {
    rescueStatus: number;
    rescueStatusName: string;
    rescuerGroups: RescuerGroup[];
}

export interface OutstandingCaseResponse {
    outstandingRescues: OutstandingCase[];
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
