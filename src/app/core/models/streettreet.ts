import  { CallerDetails, CallOutcome, LocationDetails, RescueDetails} from './emergency-record';
import {Patient} from './patients';
export interface StreetTreatTab {
    id?: number;
    value?: string | undefined;
    emergencyCaseId?: number;
    emergencyNumber?: number;
    patientId?: number;
    tagNumber?: string | undefined;
    animalType?: string;
    currentLocation?: string | undefined;
/*     callDateTime?: string;
    callOutcomeId?: number | undefined;
    callOutcome?: string | undefined; */
    [x: string] : string | any;
}

export interface StreetTreatDetails {
    streetTreatCaseId: number;
    emergencyNumber: string;
    callDateTime: string | Date;
    dispatcher: number;
    [x:string] : any;
}

export interface StreetTreatForm {
    StreetTreatDetails: StreetTreatDetails;
    patients: Patient[];
    callerDetails: CallerDetails;
    callOutcome: CallOutcome;
    locationDetails: LocationDetails;
    rescueDetails: RescueDetails;
}

export interface StreetTreatCase {
    streetTreatForm: StreetTreatForm;
}
