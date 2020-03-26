import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

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

export interface Location
{
    location: string;
    latitude: number;
    longitude: number;
}

export interface RescueDetails{
    rescuer1: number;
    rescuer2: number;
    ambulanceArrivalTime: string;
    admissionTime: string;
    rescueTime: string;
}

export interface Caller
{
    callerId: string;
    name: string;
    number: string;
    alternativeNumber: string;
}

export declare type Callers = Caller[];

export interface CallerNumberResponse
{
    callers: Callers;
}