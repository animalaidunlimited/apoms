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
