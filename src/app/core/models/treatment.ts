export interface TreatmentRecord{
    treatmentId: number;
    patientId: number;
    treatmentDateTime: Date | string;
    nextTreatmentDateTime: Date | string;
    eyeDischarge: number;
    nasalDischarge: number;
    comment: string;
  }

  export interface TreatmentResponse{
    success: number;
    treatmentId: number;
  }