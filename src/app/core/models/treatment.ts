export interface TreatmentRecord{
    treatmentId: number;
    treatmentDateTime: Date | string;
    nextTreatmentDateTime: Date | string;
    eyeDischarge: number;
    nasalDischarge: number;
    comment: string;
  }