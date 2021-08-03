import { Patient } from "../models/patients";

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

export interface DriverAssignments {
  location: string;
  patients: Patient[];
  patientId: number;
  rescueTime: string;
  actionStatus: string;
  callDateTime: string;
  visitEndDate?: any;
  callerDetails: CallerDetails[];
  emergencyCode: string;
  latLngLiteral: LatLngLiteral;
  releaseEndDate: string;
  visitBeginDate: string;
  ambulanceAction: string;
  emergencyCaseId: number;
  emergencyCodeId?: number;
  emergencyNumber: number;
  releaseBeginDate: string;
  releaseDetailsId?: number;
  releasePickupDate: string;
  streetTreatCaseId?: number;
  releaseRequestDate: string;
  streetTreatPriority: string;
  ambulanceArrivalTime: string;
  patientCallOutcomeId?: number;
  streetTreatPriorityId?: number;
  releaseComplainerNotes: string;
  streetTreatMainProblem: string;
  streetTreatMainProblemId?: number;
  isUpdated?: boolean;
  admissionTime: string;
  inTreatmentAreaId: number;
  dispatcher: number;
  caseComments: string;
  rescueAmbulanceId: number;
  rescueAmbulanceAssignmentDate: string;
  releaseAmbulanceId: number;
  releaseAmbulanceAssignmentDate: string;
  visitId: number;
  visitTypeId: number;
  visitDate: string;
  visitStatusId: number;
  visitAdminNotes: string;
  visitOperatorNotes: string;
  visitDay: number;
  streetTreatAmbulanceId: number;
  streetTreatAmbulanceAssignmentDate: string;
}



