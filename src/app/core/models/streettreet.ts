import  { CallerDetails, CallOutcome, LocationDetails, RescueDetails} from './emergency-record';
import {Patient} from './patients';
export interface StreetTreatTab {
    id: number;
    value: string | undefined;
    streetTreatCaseId: number;
    icon?: string | undefined;
    emergencyCaseId?: string | number | undefined; 
    patientId?: number | undefined;
    patientStatus?: string;
    currentLocation?:string;
}

export interface StreetTreatDetails {
    streetTreatCaseId: number;
    emergencyNumber: string;
    callDateTime: string | Date;
    dispatcher: number;
}

export interface StreetTreatForm {
    StreetTreatDetails: StreetTreatDetails;
    patients: Patient[];
    callerDetails: CallerDetails;
    callOutcome: CallOutcome;
    locationDetails: LocationDetails;
    rescueDetails: RescueDetails;
}

export interface StreetTreatCase {
    streetTreatForm: StreetTreatForm;
}
export interface StreetTreatSearchResponse {
    CaseId: number;
    EmergencyNumber: number;
    TagNumber: string;
    PercentComplete: number;
    NextVisit: string | Date;
    AnimalTypeId: number;
    PriorityId: number;
    StatusId: number;
    TeamId: number;
    AnimalName: string;
    ComplainerName: string;
    ComplainerNumber: string;
    Address: string;
    Latitude: number;
    Longitude: number;
    AdminNotes: string;
    OperatorNotes?: any;
    ReleasedDate: string;
    ClosedDate?: any;
    IsIsolation: number;
    EarlyReleaseFlag?: any;
    IsDeleted: number;
    MainProblemId: number;
  }

  export interface StreetTreatSearchVisitsResponse{
    VisitId:number; 
    StreetTreatCaseId:number; 
    VisitTypeId:number; 
    VisitType:string; 
    Date:Date; 
    StatusId:number; 
    Status:number; 
    AdminNotes:string; 
    OperatorNotes:string; 
    IsDeleted: 0|1| null;  
}

export interface Team {
    TeamId: number;
    TeamName: string;
}

export interface Visit {
    Date: string;
    StatusId: number;
    VisitTypeId: number;
}

export interface Position {
    Address: string;
    Latitude: number;
    Longitude: number;
}

export interface Emergency {
    EmergencyCase: number;
    EmergencyNumber: number;
}

export interface AnimalDetails {
    Priority: string;
    TagNumber: string;
    AnimalName?: any;
    AnimalType: string;
}

export interface StreetTreatCaseByVisitDateResponse {
    Team: Team;
    Visit: Visit[];
    Position: Position;
    Emergency: Emergency;
    AnimalDetails: AnimalDetails;
    StreetTreatCaseId: number;
}

export interface ActiveCasesForTeamByDateResponse {
    CaseId: number;
    EmergencyNumber: number;
    TagNumber: string;
    AnimalType: string;
    AnimalTypeId: number;
    Status: string;
    StatusId: number;
    AnimalName?: any;
    NextVisit: Date;
    NextVisitStatusId: number;
    PercentComplete: number;
    Address: string;
    Priority: string;
    PriorityId: number;
    TeamName: string;
    TeamId: number;
    Latitude: number;
    Longitude: number;
    ComplainerName: string;
    ComplainerNumber: string;
    AdminNotes?: any;
    OperatorNotes?: any;
    ReleasedDate: Date;
    ClosedDate?: any;
    EarlyReleaseFlag?: any;
    MainProblemId: number;
    MainProblem: string;
}

