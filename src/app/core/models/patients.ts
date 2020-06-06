import { Problem } from './problem';

export interface Patient {
    patientId: number;
    createdDate: string | Date;
    position: number;
    animalTypeId: number;
    animalType: string;
    problems: Problem[];
    problemsString: string;
    tagNumber: string;
    duplicateTag: boolean;
    patientStatusId: number;
    patientStatusDate: string | Date;
    updated: boolean;
    deleted: boolean;
}

export interface Patients {
    patients: Patient[];
}

export interface PatientCalls {
    patientId: number;
    calls: PatientCall[];
}

export interface PatientCall {
    position: number;
    patientCallId: number;
    patientId: number;
    positiveCallOutcome: boolean;
    callDateTime: string | Date;
    assignedTo: number;
    callType: number;
    patientCallOutcomeId: number;
    createdDateTime: string | Date;
    createdBy: number;
    comments: string;
    updated: boolean;
}

export interface PatientCallResult {
    success: number;
    patientCallId: number;
}

export interface PatientCallModifyResponse {
    position: number;
    results: PatientCallResult;
}
