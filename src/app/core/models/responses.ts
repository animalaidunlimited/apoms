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