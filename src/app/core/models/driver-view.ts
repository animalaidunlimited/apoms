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
  location: string;
  patients: Patient[];
  patientId: number;
  rescueTime: string | null;
  actionStatus: string | null;
  callDateTime: string;
  visitEndDate?: any;
  callerDetails: CallerDetails[];
  emergencyCode: string;
  latLngLiteral: LatLngLiteral;
  releaseEndDate: string | null;
  visitBeginDate: string | null;
  ambulanceAction: string;
  emergencyCaseId: number;
  emergencyCodeId?: number;
  emergencyNumber: number;
  releaseBeginDate: string | null;
  releaseDetailsId?: number | null;
  releasePickupDate: string | null;
  streetTreatCaseId?: number | null;
  releaseRequestDate: string | null;
  streetTreatPriority: string | null;
  ambulanceArrivalTime: string | null;
  patientCallOutcomeId?: number | null;
  streetTreatPriorityId?: number | null;
  releaseComplainerNotes: string | null;
  streetTreatMainProblem: string | null;
  streetTreatMainProblemId?: number | null;
  isUpdated?: boolean;
  admissionTime: string | null;
  inTreatmentAreaId: number;
  dispatcher: number;
  caseComments: string;
  rescueAmbulanceId: number;
  rescueAmbulanceAssignmentDate: string;
  releaseAmbulanceId: number | null;
  releaseAmbulanceAssignmentDate: string | null;
  visitId: number | null;
  visitTypeId: number | null;
  visitDate: string | null;
  visitStatusId: number | null;
  visitAdminNotes: string | null;
  visitOperatorNotes: string | null;
  visitDay: number;
  streetTreatAmbulanceId: number | null;
  streetTreatAmbulanceAssignmentDate: string | null;
  rescuerList:number[];
  trueStatus: string;
}



