import { Patient } from '../models/patients';

export interface Vehicle {
  vehicleId: number;
  vehicleType: string;
  vehicleNumber: string;
  vehicleStatus: string;
  vehicleTypeId: number;
  vehicleStatusId: number;
  registrationNumber: string;
  largeAnimalCapacity: number;
  smallAnimalCapacity: number;
  minRescuerCapacity: number;
  maxRescuerCapacity: number;
  currentVehicleStaff?: string;
  imageURL: string;
}

export interface VehicleType {
  VehicleTypeId : number;
  VehicleType: string;
}

export interface VehicleStatus {
  VehicleStatusId: number;
  VehicleStatus: string;
}

export interface CallerDetails {
  callerId: number;
  callerName: string;
  callerNumber: string;
  callerAlternativeNumber: string;
}

export interface LatLngLiteral {
  lat: number;
  lng: number;
}

export interface DriverAssignment {
  actionStatus: string | null;
  actionStatusId?: number;
  admissionTime: string | null;
  ambulanceAction: string;
  ambulanceArrivalTime: string | null;
  callDateTime: string;
  callerDetails: CallerDetails[];
  caseComments: string;
  dispatcher: number;
  emergencyCaseId: number;
  emergencyCode: string;
  emergencyCodeId?: number;
  emergencyNumber: number;
  filterCandidate: boolean;
  inTreatmentAreaId: number;
  isUpdated?: boolean;
  latLngLiteral: LatLngLiteral;
  location: string;
  moved: boolean;
  patientCallOutcomeId?: number | null;
  patientId: number;
  patients: Patient[];
  releaseAmbulanceAssignmentDate: string | null;
  releaseAmbulanceId: number | null;
  releaseBeginDate: string | null;
  releaseComplainerNotes: string | null;
  releaseDetailsId?: number | null;
  releaseEndDate: string | null;
  releasePickupDate: string | null;
  releaseRequestDate: string | null;
  rescueAmbulanceAssignmentDate: string;
  rescueAmbulanceId: number;
  rescueTime: string | null;
  rescuerList?:number[];
  searchCandidate: boolean;
  streetTreatAmbulanceAssignmentDate: string | null;
  streetTreatAmbulanceId: number | null;
  streetTreatCaseId?: number | null;
  streetTreatMainProblem: string | null;
  streetTreatMainProblemId?: number | null;
  streetTreatPriority: string | null;
  streetTreatPriorityId?: number | null;
  trueStatus: string;
  visitAdminNotes: string | null;
  visitBeginDate: string | null;
  visitDate: string | null;
  visitDay: number;
  visitEndDate?: any;
  visitId: number | null;
  visitOperatorNotes: string | null;
  visitStatusId: number | null;
  visitTypeId: number | null;
}



