export interface SearchRecordTab {
    id: number;
    value: string | undefined;
    emergencyCaseId: number;
    emergencyNumber: number;
    patientId: number;
    tagNumber: string | undefined;
    animalType: string;
    currentLocation: string | undefined;
    callDateTime: string | Date | undefined;
    callOutcomeId: number | undefined;
    callOutcome: string | undefined;
    icon: string | undefined;
}

export interface SearchResponseWrapper {
    caseSearchResult: SearchRecordTab;
}
