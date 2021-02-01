 export interface ReleasePatient {
    tagNumber : number;
    emergencyCaseId: number;
    patientId: number;
  }


  export interface ReleaseDetails {
    releaseId: number;
    emergencyCaseId: number;
    releaseType: string;
    Releaser1: number;
    Releaser2: number;
    releaseBeginDate: string | Date;
    releaseEndDate: string | Date;
    pickupDate: string | Date;
  }