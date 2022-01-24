import { CallOutcome } from './emergency-record';
import { Problem } from './problem';

export interface Patient {
    patientId: number;
    createdDate: string | Date;
    position: number;
    animalTypeId: number;
    largeAnimal: number | null;
    animalType: string;
    problems: Problem[];
    problemsString: string;
    tagNumber: string;
    duplicateTag: boolean;
    patientStatusId: number;
    patientStatusDate: string | Date;
    updated: boolean;
    deleted: boolean;
    isAdmission: boolean;
    admissionArea: number | null;
    admissionAccepted: boolean | null;
    treatmentPriority: number;
    callOutcome: CallOutcome;
    mediaCount: number;
}

export interface UpdatePatientDetails{
    patientId: number;
    animalTypeId: number;
    mainProblems: string;
    description: string;
    sex: number;
    treatmentPriority: number;
    abcStatus: number;
    releaseStatus: number;
    temperament: number;
    age: number;
    knownAsName: string;
}

export interface Patients{
    patients: Patient[];
}

export interface PatientCalls {
    patientId: number;
    calls: PatientCall[];
}

export interface PatientCall {
    position: number;
    patientCallerInteractionId: number;
    patientId: number;
    positiveCallOutcome: boolean;
    callDateTime: string | Date | undefined;
    assignedTo: number;
    callType: number;
    patientCallerInteractionOutcomeId: number;
    createdDateTime: string | Date;
    createdBy: number;
    comments: string;
    updated: boolean;
}

export interface PatientCallResult {
    success: number;
    patientCallerInteractionId: number;
}

export interface PatientCallModifyResponse {
    position: number;
    results: PatientCallResult;
    success: number;
}

export interface CrueltyReportResult{
    success: number;
    crueltyReportId: number;
}

export interface CrueltyReport{
    crueltyReportId: number;
    patientId: number;
    crueltyReport: string;
    postCrueltyReport: string;
    crueltyInspectorId: number;
}

export interface Antibiotic{
    antibioticId: number;
    antibiotic: string;
}

export interface PatientOutcome{
    patientOutcomeDetailsId: number;
    patientId: number;
    vaccinationDetails: VaccinationDetails;
    antibioticDetails: AntibioticDetails;
    isoReason: IsoReason;
}

export interface VaccinationDetails{
    megavac1Date: string | Date;
    megavac2Date: string | Date;
    rabiesVaccinationDate: string | Date;
}

export interface AntibioticDetails{
    antibiotics1: number;
    antibiotics2: number;
    antibiotics3: number;
}

export interface IsoReason{
    isoReason: number;
}

export interface PatientOutcomeResponse{
    patientOutcomeDetailsId: number;
    success: number;
}

export interface PriorityObject {
    patientId: number;
    priorityValueId: number;
    updatePriorityFlag: boolean;
}
export interface TreatmentAreaDropdwn {
    AreaId: number;
    Area: string;
}

export interface PatientStatusObject {
    patientStatusId: number;
    patientStatus: string;
}