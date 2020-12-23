 export interface ReleasePatient {
    tagNumber : number;
    emergencyCaseId: number;
    patientId: number;
  }


  export interface ReleaseDetails {
    releaseId: number;
    emergencyCaseId: number;
    releaseType: number;
    Releaser1: number;
    Releaser2: number;
    releaseBeginDate: Date | string;
    releaseEndDate: Date | string;
    pickupDate: Date | string;
  }

  export interface ReleaseResponse {
    Releaser1?: any;
    Releaser2?: any;
    patientId: number;
    releaseId: number;
    releaseType: number;
    releaseEndDate?: any;
    complainerNotes: string;
    streetTreatForm: StreetTreatForm;
    releaseBeginDate?: any;
    complainerInformed: number;
    releaseRequestForm: ReleaseRequestForm;
  }
  
  interface ReleaseRequestForm {
    requestedDate: string;
    requestedUser: string;
  }
  
  interface StreetTreatForm {
    teamId: number;
    visits: VisitResponse[];
    patientId: number;
    adminNotes: string;
    mainProblem: number;
    casePriority: number;
    streetTreatCaseId: number;
    streetTreatCaseStatus: number;
  }
  
  export interface VisitResponse {
    visitId: number;
    visit_day: number;
    visit_type: number;
    visit_status: number;
    visit_comments?: string;
    visit_date?: Date;
  }