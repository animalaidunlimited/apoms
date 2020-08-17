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
    errorCode: number;
}

export interface CensusAreaName {
    AreaId: number;
    Area: string;
}
