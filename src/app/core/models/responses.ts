import { LatLngLiteral } from './driver-view';
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
    IsDeleted: boolean;
    SortOrder: number;
}

export interface PatientResponse {
    patientId: number;
    tagNumber: string;
    GUID: number;
    success: number;
    admissionSuccess: number;
    problems: ProblemResponse[];
}

export interface SearchFieldResponse {
    success: string;
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
    latLngLiteral: LatLngLiteral;
}

export interface RescueDetails {
    rescueTime: string | Date;
    admissionTime: string | Date;
    ambulanceArrivalTime: string | Date;
    rescuers: Rescuer[];
    selfAdmission: boolean;
}

export interface Rescuer {
    rescuerId: number;
    rescuerEmployeeNumber: string;
    rescuerFirstName: string;
    rescuerSurname: string;
    rescuerColour: string;
    rescuerAbbreviation: string;
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
    CallDateTime: string | Date | undefined;
    callerDetails: CallerDetails[] | any;
    AnimalTypeId: number;
    AnimalType: string;
    PatientId: number;
    MediaCount: number;
    TagNumber: string;
    CallOutcomeId: number | undefined;
    CallOutcome: string | undefined;
    sameAsNumber: number | undefined;
    Location: string;
    latLngLiteral: LatLngLiteral;
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