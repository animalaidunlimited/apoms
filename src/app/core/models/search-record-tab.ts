export interface SearchRecordTab {
    id: number;
    value: string;
    emergencyCaseId: number;
    emergencyNumber: number;
    patientId: number;
    tagNumber: string;
    animalType:string;
    currentLocation: string;
    callDateTime: string;
    callOutcome: number;
    icon: string;
}

export interface SearchResponseWrapper {
    caseSearchResult: SearchRecordTab;
}