import { Problem } from './problem';

export interface Patient {
    patientId: number;
    createdDate: string | Date;
    position: number;
    animalTypeId: number;
    animalType: string;
    problems: Problem[];
    problemsString: string;
    tagNumber: string;
    duplicateTag: boolean;
    patientStatusId: number;
    patientStatusDate: string | Date;
    updated: boolean;
    deleted: boolean;
  }

  export interface Patients {
    patients: Patient[];
}

export interface PatientCall {
      patientCallId: number;
      patientId: number;
      positiveCallOutcome: boolean;
      callTime: string|Date;
      assignedTo: number;
      callType: number;
      patientCallOutcome: number;
      createdDate:string|Date;
      createdBy: number;
      comments: string;
      updated: boolean;
}


