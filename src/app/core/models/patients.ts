import { Problem } from './problem';

export interface Patient {
    patientId: number;
    position: number;
    animalTypeId: number;
    animalType: string;
    problems: Problem[];
    problemsString: string;
    tagNumber: string;
    duplicateTag: boolean;
    updated: boolean;
    deleted: boolean;
  }


  export interface Patients {
    patients: Patient[];
}