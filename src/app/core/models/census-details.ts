export interface Area {
    areaId: number;
    areaName: string;
    sortArea: number;
    actions: Action[];
}

export interface Action {
    actionId: number;
    actionName: string;
    sortAction: number;
    patients: CensusPatient[];
}

export interface CensusPatient {
    patientId: number;
    tagNumber: string;
    colour: string;
    errorCode: number;
}

export interface CensusArea {
    areaId:number;
    areaName : string;
}

export interface ReportPatientRecord {
    'Emergency number': number;
    'Tag number': string;
    'Species': string;
    'Caller name' : string;
    'Number' : number;
    'Call date' : string;
    'ABC status': number | string;
    'Release ready': boolean;
    'Release status': number | string;
    'Temperament': number | string;
    'Treatment priority': number | string;
}

export interface CensusPrintContent{
    area: string;
    displayColumns: string[];
    printList: ReportPatientRecord[];
}
