import { Patient } from './patients';
import { CallOutcomeResponse } from './call-outcome';

export interface EmergencyDetails {
    emergencyCaseId: number;
    guId:string;
    emergencyNumber: number;
    callDateTime: string | Date | undefined;
    dispatcher: number;
    code: EmergencyCode;
    updateTime: string | Date;
}

export interface EmergencyCode {
    EmergencyCodeId: number;
    EmergencyCode: string;
}

export interface CallerDetails {
    callerId: number;
    callerName: string;
    callerNumber: string;
    callerAlternativeNumber: string;
}

export interface CallOutcome {
    CallOutcome: CallOutcomeResponse;
    sameAsNumber: number | null;
}

export interface LocationDetails {
    animalLocation: string;
    latitude: number;
    longitude: number;
}

export interface RescueDetails {
    rescuer1: number;
    rescuer2: number;
    ambulanceArrivalTime: string | Date;
    rescueTime: string | Date;
    admissionTime: string | Date;
}

export interface EmergencyForm {
    emergencyDetails: EmergencyDetails;
    patients: Patient[];
    callerDetails: CallerDetails;
    callOutcome: CallOutcome;
    locationDetails: LocationDetails;
    rescueDetails: RescueDetails;
}

export interface EmergencyCase {
    emergencyForm: EmergencyForm;
}

export interface EmergencyTab {
    EmergencyCaseId: number;
    EmergencyNumber: number;
}


export interface EmergencyRecordTable {
    emergencyNumber: number;
    callDateTime: Date | string;
    animalType: string;
    tagNumber : string;
    location : string;
    dispatcher: string;
    staff1: string;
    staff2: string;
    callOutcome: string;
}

