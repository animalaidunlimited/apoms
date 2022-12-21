export interface User {
    userId: number;
    employeeNumber: string;
    firstName: string;
    surname: string;
    initials: string;
    colour?: string;
}


export interface UserJobType {
    JobTypeId : number;
    Title: string;
}

export interface UserDetails {
    userId : number;
    employeeNumber: string;
    firstName: string;
    surname: string;
    initials: string;
    colour: string;
    telephone: number;
    userName: string;
    roleId: number;
    role: string;
    jobTitleId: number;
    jobTitle: string;
    permissionArray: number[];
    fixedDayOff: number[];
    departmentId: number;
    localName: string;
    isDeleted: boolean;
  }

export interface UserDetailsForm extends UserDetails {
    password: string;
    isStreetTreatUser: boolean;
}

export interface ReleaseManager {
    EmployeeNumber: string;
    FirstName: string;
}

export interface UserAccountDetails{
    fullname: string;
    initials: string;
    preferences: UserPreferences;
}

export interface UserPreferences {
    clearSearchOnTabReturn? : boolean;
    rotaAreas?: number[];
}
