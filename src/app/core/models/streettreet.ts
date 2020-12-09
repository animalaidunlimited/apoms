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



