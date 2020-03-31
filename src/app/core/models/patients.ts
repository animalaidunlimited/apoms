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