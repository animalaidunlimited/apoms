import { Problem } from './problem';

export interface Patient {
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