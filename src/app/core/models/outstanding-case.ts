export interface OutstandingRescue {
    rescueStatus: number;
    rescuer1: number;
    rescuer2: number;
    callDateTime: string;
    callOutcomeId: any;
    callerName: string;
    callerNumber: string;
    emergencyCaseId: number;
    emergencyCodeId: number;
    emergencyNumber: number;
    latitude: number;
    location: string;
    longitude: number;
    moved:boolean;
    searchCandidate:boolean;
}

export interface RescuerGroup {
    rescuer1: number;
    rescuer1Abbreviation: string;
    rescuer2: number;
    rescuer2Abbreviation: string;
    rescues: OutstandingRescue[];
}

export interface OutstandingCase {
    rescueStatus: number;
    rescuerGroups: RescuerGroup[];
}

export interface OutstandingCaseResponse {
    outstandingRescues: OutstandingCase[];
}

export interface UpdatedRescue{
    success:number;
    emergencyCaseId:number;
    rescuer1Id:number;
    rescuer1Abbreviation:string;
    rescuer2Id:number;
    rescuer2Abbreviation:string;
    rescueStatus:number;
}
