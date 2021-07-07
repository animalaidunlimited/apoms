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
    releaseBeginDate: Date | string;
    releaseEndDate: Date | string;
    pickupDate: Date | string;
    assignedVehicleId: number;
    ambulanceAssignmentTime: Date;
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

  export interface StreetTreatForm {
    teamId: number;
    visits: VisitResponse[];
    patientId: number;
    adminNotes: string;
    autoAdded: boolean;
    mainProblem: number;
    casePriority: number;
    streetTreatCaseId: number;
    streetTreatCaseStatus: number;
    patientReleaseDate?:string;
  }

  export interface VisitResponse {
    visitId: number;
    visit_day: number;
    visit_type: number;
    visit_status: number;
    visit_comments?: string;
    visit_date?: Date;
  }