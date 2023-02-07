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
    callDateTime: string | Date | undefined;
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
    AssignedVehicleId: number;
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

export interface Visit {
    VisitDate: string;
    VisitStatus: string;
    VisitTypeId: number;
    VisitStatusId: number;
}

export interface Position {
    Address: string;
    Latitude: number;
    Longitude: number;
}

export interface AnimalDetails {
    Problem: string;
    Priority: string;
    TagNumber: string;
    AnimalName?: string;
    AnimalType: string;
    MainProblem: string;
    PatientId: number;
    EmergencyCaseId: number;
}

export interface StreetTreatCaseVisit {
    Visits: Visit[];
    Position: Position;
    AnimalDetails: AnimalDetails;
    StreetTreatCaseId: number;
    StreetTreatCaseStatus: string;
    StreetTreatCasePriority: string;
    StreetTreatCaseStatusId: number;
    StreetTreatCasePriorityId: number;
}

export interface StreetTreatCases {
    VehicleId: number;
    VehicleNumber: string;
    VehicleColour: string;
    StreetTreatCaseVisits: StreetTreatCaseVisit[];
}

export interface StreetTreatCaseByVisitDateResponse {
    Cases: StreetTreatCases[] | null;
    TotalCases: number;
    UrgentCases: number;
}

export interface ActiveCasesForVehicleByDateResponse {
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
    VehicleNumber: string;
    VehicleId: number;
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

export interface Series {
    name: string;
    value: number;
}

export interface ChartData {
    name: string;
    series: Series[] | never[];
}

export interface VehicleColour {
    name: string;
    value: string;
}

export interface ChartSelectObject extends VehicleColour {
    label: string;
    series: string;
}

export interface ChartResponse {
    chartData: ChartData[];
    vehicleColours: VehicleColour[];
}

export interface StreetTreatScoreCard {
    TotalActiveCases: number;
    CasesWithVisitToday: number;
    VisitsToday: number;
    TotalPlannedVisits: number;
    OutstandingVisitsToday: number;
    CompleteVisitsToday: number;
    TotalUrgentCases: number;
    OutstandingUrgentVisitsToday: number;
    CompletedUrgentVisitsToday: number;
    NoVisits: number;
}

export interface StreetTreatRole {
    roleId: number;
    roleName: string;
  }