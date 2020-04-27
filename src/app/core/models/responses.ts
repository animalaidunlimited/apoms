import { CallOutcome, EmergencyDetails } from './emergency-record';

export interface EmergencyResponse
{
    callerId: number;
    callerSuccess: number;
    emergencyCaseId: number;
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
    position: number;
    success: number;
    problems: ProblemResponse[];
}

export interface SearchFieldResponse
{
    sucess: string;
}

export interface LocationResponse
{
    locationDetails: Location;
}

export interface Location
{
    location: string;
    latitude: number;
    longitude: number;
}

export interface RescueDetailsParent {
    callOutcome: CallOutcome;
    rescueDetails: RescueDetails;
    emergencyDetails: EmergencyDetails;
}


export interface RescueDetails{
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

export interface Caller
{
    CallerId: string;
    Name: string;
    Number: string;
    AlternativeNumber: string;
}

export declare type Callers = Caller[];

export interface CallerNumberResponse
{
    callers: Callers;
}

export interface searchResponseWrapper{
    caseSearchResult: SearchResponse;
}

export interface SearchResponse{
    EmergencyCaseId: number;
    EmergencyNumber: number;
    CallDateTime: string;
    CallerId: number;
    Name: string;
    Number: string;
    AnimalTypeId: number;
    AnimalType: string;
    PatientId: number;
    TagNumber: string;
    CallOutcome: number;
    Location: string;
    Latitude: number;
    Longitude: number;
    CurrentLocation: string;
}

export interface PatientStatus{
    PatientId: number;
    PatientStatusId: number;
    PatientStatusDate: Date;
}

export interface CallType{
    CallTypeId: number;
    CallType: string;
}

export interface PatientCallOutcome{
    PatientCallOutcomeId: number;
    PatientCallOutcome: string;
}
