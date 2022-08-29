import { AbstractControl } from '@angular/forms';

export interface LogsData {
    emergencyCaseId: number;
    patientFormArray: AbstractControl[];
}

export interface LogSearchObject{
    emergencyCaseId: number;
    patientIds: string;
}