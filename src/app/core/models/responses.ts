export interface EmergencyResponse
{
    status: string;
    emergencyNumber: number;
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