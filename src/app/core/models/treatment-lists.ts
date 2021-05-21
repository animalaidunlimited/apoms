import { FormArray } from '@angular/forms';

export interface TreatmeantListObject{
    treatmentListType: string;
    treatmentListArray: FormArray;
  }

  export interface TreatmentListPrintObject{
    area: TreatmentArea;
    selectedDate: Date | string;
  }

  export interface TreatmentListPatient {
    patientId: number | undefined;
    tagNumber: string;
    colour: string;
    errorCode: number | undefined;
}

export interface TreatmentArea {
    areaId:number;
    areaName : string;
    sortArea?: number;
    abbreviation?: string;
    mainArea?: boolean;
}

export interface TreatmentAreaChange {
    treatmentListId: number | undefined;
    admission: boolean;
    patientId: number;
    movedFromArea: number;
    movedToArea: number;
    movedDate: Date | string;
    movedInAccepted: boolean;
}

export interface TreatmentListMoveIn {
    treatmentListId: number;
    patientId: number;
    admission: boolean;
    accepted: boolean;
}

export interface TreatmentList {
    treatmentListType: string;
    treatmentList: ReportPatientRecord[];
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
    'Main problems': string;
    'Description': string;
    'Sex': number;
    'Known as name': string;
    animalTypeId: number;
    showOther: boolean;
    treatedToday: boolean;
}

export interface TreatmentListPrintContent{
    area: string;
    displayColumns: string[];
    printList: ReportPatientRecord[];
}

export interface PatientCountInArea{
    area: string;
    sortArea: number;
    lowPriority: number;
    normalPriority: number;
    highPriority: number;
    urgentPriority: number;
    infants: number;
    adults: number;
    count : number;
}