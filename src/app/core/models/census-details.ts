export interface Area {
    areaId: number | undefined;
    areaName: string;
    sortArea: number | undefined;
    actions: Action[];
}

export interface Action {
    actionId: number | undefined;
    actionName: string;
    sortAction: number | undefined;
    patients: CensusPatient[];
}

export interface CensusPatient {
    patientId: number | undefined;
    tagNumber: string;
    colour: string;
    errorCode: number | undefined;
}

export interface CensusArea {
    areaId:number;
    areaName : string;
    sortArea?: number;
    abbreviation?: string;
}

export interface ReportPatientRecord {
    currentAreaId?: number;
    'Emergency number': number;
    'PatientId': number;
    'Tag number': string;
    'Species': string;
    'Age': number | string;
    'Caller name' : string;
    'Number' : number;
    'Call date' : string;
    'ABC status': number | string;
    'Release ready': boolean;
    'Release status': number | string;
    'Temperament': number | string;
    'Treatment priority': number;
    showOther: boolean;
    treatedToday: boolean;
}

export interface CensusPrintContent{
    area: string;
    displayColumns: string[];
    printList: ReportPatientRecord[];
}

export interface PatientCountInArea{
    area : string;
    lowPriority: number;
    normalPriority: number;
    highPriority: number;
    urgentPriority: number;
    infants: number;
    adults: number;
    count : number;
}