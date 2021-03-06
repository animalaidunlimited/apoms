export interface Surgeon {
    SurgeonId: number;
    FirstName: string;
}

export interface SurgeryType {
    SurgeryTypeId: number;
    SurgeryType: string;
}

export interface SurgerySite {
    SurgerySiteId: number;
    SurgerySite: string;
}

export interface SurgeryById {
    surgeryId: number;
}

export interface UpdatedSurgery {
    date: string | Date;
    type: string;
    surgeon: string;
    site: string;
    anesthesiaMinutes: number;
}

export interface SurgeryFormModel {
    success: number;
    PatientId: number;
    SurgeryId: number;
    TagNumber: string;
    EmergencyNumber: number;
    AnimalTypeId: string;
    SurgeryDate: string | Date;
    SurgeonId: number;
    SurgerySiteId: number;
    AnesthesiaMinutes: number;
    SurgeryTypeId: number;
    DiedDate: string | Date;
    DiedComment: string;
    AntibioticsGiven: number;
    Comment: string;
}

export interface SurgeryRecord {
    surgeryId: number;
    date: string | Date;
    type: string;
    surgeon: string;
    site: string;
    anesthesiaMinutes: number;
    died: string;
    comments: string;
    antibioticsGiven: string;
}
