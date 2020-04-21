import { NumberValueAccessor } from '@angular/forms';

export interface OutstandingCase
{
    EmergencyCaseId: number;
    EmergencyNumber: number;
    EmergencyCodeId: number;
    CallDateTime: string | Date;
    CallOutcomeId: number;
    Location: string
    Latitude: number;
    Longitude: number;
    Rescuer1: string;
    Rescuer1ImageURL: string;
    Rescuer2: string;
    Rescuer2ImageURL: string;
    CallerName: string;
    CallerNumber: string;
    RescueStatus: number;
    Moved: boolean;
    SearchCandidate: boolean;
}

export interface UpdatedRescue{
    success:number;
    emergencyCaseId:number;
    rescueStatus:number;
}
