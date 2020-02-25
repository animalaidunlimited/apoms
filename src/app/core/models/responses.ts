export interface EmergencyResponse
{
    status: string;
    EmergencyNumber: number;
}

export interface Caller
{
    CallerId: string;
    Name: string;
    Number: string;
    AlternativeNumber: string;
}

export declare type Callers = Caller[];

export interface CallerNumberResponse
{
    callers: Callers;
}