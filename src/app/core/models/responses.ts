import { CallerDetails, CallOutcome, EmergencyDetails } from './emergency-record';


export interface EmergencyResponse {
   emergencyCallerSuccess: [];
    callerSuccess: [];
    emergencyCaseId: number;
    emergencyNumber: number;
    guId: string;
    emergencyCaseSuccess: number;
    patients: PatientResponse[];
}

export interface ProblemResponse {
    problemId: number;
    success: number;
}

export interface ProblemDropdownResponse {
    ProblemId: number;
    Problem: string;
}

export interface PatientResponse {
    patientId: number;
    tagNumber: string;
    position: number;
    success: number;
    problems: ProblemResponse[];
}

export interface SearchFieldResponse {
    sucess: string;
}

export interface LocationResponse {
    locationDetails: Location;
}

export interface Location {
    location: string;
    latitude: number;
    longitude: number;
}

export interface RescueDetailsParent {
    callOutcome: CallOutcome;
    rescueDetails: RescueDetails;
    emergencyDetails: EmergencyDetails;
}

export interface RescueDetails {
    rescueTime: string | Date;
    rescuer1Id: number;
    rescuer2Id: number;
    admissionTime: string | Date;
    rescuer1Colour: string;
    rescuer2Colour: string;
    ambulanceArrivalTime: string | Date;
    rescuer1Abbreviation: string;
    rescuer2Abbreviation: string;
}

export interface Caller {
    callerId: number;
    callerName: string;
    callerNumber: string;
    callerAlternativeNumber: string;
}

export declare type Callers = Caller[];

export interface CallerNumberResponse {
    callers: Callers;
}

export interface SearchResponseWrapper {
    caseSearchResult: SearchResponse[];
}

export interface Exclusions
{
    animalType: string;
    exclusionList: string[];
}

export interface SearchResponse {
    EmergencyCaseId: number;
    EmergencyNumber: number;
    CallDateTime: string;
    callerDetails: CallerDetails[] | any;
    // CallerId: number;
    // Name: string;
    // Number: string;
    AnimalTypeId: number;
    AnimalType: string;
    PatientId: number;
    MediaCount: number;
    TagNumber: string;
    CallOutcomeId: number | undefined;
    CallOutcome: string | undefined;
    sameAsNumber: number | undefined;
    Location: string;
    Latitude: number;
    Longitude: number;
    CurrentLocation: string | undefined;
}
export interface SearchStreetTreatResponse {
    AnimalType: string;
    AnimalTypeId: number;
    CallDateTime: number;
    CallOutcome: string | undefined;
    CallOutcomeId: number | undefined;
    CallerId: number;
    CurrentLocation: string | undefined;
    EmergencyCaseId: number;
    EmergencyNumber: number;
    StreetTreatCaseId:number;
    Latitude: number;
    Location: string;
    Longitude: number;
    MediaCount: number;
    Name: string;
    Number: string;
    PatientId: number;
    NextVisit: string;
    TagNumber: string;
    UserName: string;
    sameAsNumber: string | undefined;
    streetTreatCaseSuccess? : number;
    ReleaseStatus: 'Pending' | 'Released';
}

export interface PatientStatus {
    PatientId: number;
    PatientStatusId: number;
    PatientStatus: string;
    PatientStatusDate: Date;
}

export interface PatientStatusResponse {
    PatientStatusId: number;
    PatientStatus: string;
}

export interface CallType {
    CallTypeId: number;
    CallType: string;
}

export interface PatientCallerInteractionOutcome {
    PatientCallerInteractionOutcomeId: number;
    PatientCallerInteractionOutcome: string;
}

export interface StreetTreatMainProblem {
    MainProblemId: number;
    MainProblem: string;
}

export interface SuccessOnlyResponse{
    success: number;
}