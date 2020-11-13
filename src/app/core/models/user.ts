export interface User {
    UserId: number;
    FirstName: string;
    Initials: string;
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