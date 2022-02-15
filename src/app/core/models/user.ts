export interface User {
    userId: number;
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
    firstName: string;
    surName: string;
    initials: string;
    colour: string;
    telephone: number;
    userName: string;
    teamId: number;
    team: string;
    roleId: number;
    role: string;
    jobTitleId: number;
    jobTitle: string;
  }

export interface ReleaseManager {
    FirstName: string;
}

export interface UserAccountDetails{
    fullname: string;
    initials: string;
    preferences: UserPreferences;
}

export interface UserPreferences {
    clearSearchOnTabReturn? : boolean;
}
