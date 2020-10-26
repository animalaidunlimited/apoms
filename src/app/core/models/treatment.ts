export interface TreatmentRecord{
    treatmentId: number;
    patientId: number;
    treatmentDateTime: Date | string;
    nextTreatmentDateTime: Date | string;
    eyeDischarge: number | string;
    nasalDischarge: number | string;
    comment: string;
    deleted: boolean;
  }

  export interface TreatmentResponse{
    success: number;
    treatmentId: number;
  }