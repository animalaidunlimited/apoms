import { FormArray } from '@angular/forms';
import { CensusArea } from './census-details';


export interface TreatmeantListObject{
    treatmentListType: string;
    treatmentListArray: FormArray;
  }

  export interface TreatmentListPrintObject{
    area: CensusArea;
    selectedDate: Date | string;
  }