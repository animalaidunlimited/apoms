import { formatDate } from '@angular/common';
import { UUID } from 'angular2-uuid';
import { DriverAssignment } from '../models/driver-view';
import { OutstandingAssignment } from '../models/outstanding-case';
import { SearchResponse } from '../models/responses';
import { AreaShift, RotationRole } from '../models/rota';
import { HourRange } from 'src/app/core/models/vehicle';

export function getCurrentTimeString() : string {
    let currentTime = new Date();

    const wn = window.navigator as any;
    let locale = wn.languages ? wn.languages[0] : 'en-GB';
    locale = locale || wn.language || wn.browserLanguage || wn.userLanguage;

    currentTime = new Date(
        currentTime.getTime() + currentTime.getTimezoneOffset(),
    );

    return formatDate(currentTime, 'yyyy-MM-ddTHH:mm', locale);
}

export function getCurrentDateString() : string {
    let currentTime = new Date();

    const wn = window.navigator as any;
    let locale = wn.languages ? wn.languages[0] : 'en-GB';
    locale = locale || wn.language || wn.browserLanguage || wn.userLanguage;

    currentTime = new Date(
        currentTime.getTime() + currentTime.getTimezoneOffset(),
    );

    return formatDate(currentTime, 'yyyy-MM-dd', locale);
}

/* Formats the date to correct format*/
export function formatDateString(date: Date) : string {
    const wn = window.navigator as any;
    const locale = wn.languages ? wn.languages[0] : 'en-GB';
    return formatDate(date, 'yyyy-MM-dd', locale);
}

export function formatDateForMinMax(dateString: string | Date) : string {

    const dateVal = Date.parse(dateString.toString());

    const wn = window.navigator as any;
    const locale = wn.languages ? wn.languages[0] : 'en-GB';

    return formatDate(dateVal, 'yyyy-MM-ddTHH:mm', locale);

}


// Determine if the given File is an Image (according do its Mime-Type).
export function isImageFile(file: File): boolean {

    return file.type.search(/^image\//i) === 0;
}

// Determine if the given File is an Video (according do its Mime-Type).
export function isVideoFile(file: File): boolean {

    return file.type.search(/^video\//i) === 0;
}

// A function to return a UUID
export function generateUUID() : string{
    return UUID.UUID();
}

export function convertAssignmentToSearchResponse(caseSearchResult:OutstandingAssignment | DriverAssignment) : SearchResponse{


    const result:SearchResponse = {

      EmergencyCaseId: caseSearchResult.emergencyCaseId,
      EmergencyNumber: caseSearchResult.emergencyNumber,
      CallDateTime: caseSearchResult.callDateTime?.toString(),
      callerDetails: caseSearchResult.callerDetails,
      AnimalTypeId: 0,
      AnimalType: '',
      PatientId: 0,
      MediaCount: 0,
      TagNumber: '',
      CallOutcomeId: 0,
      CallOutcome: undefined,
      sameAsNumber: undefined,
      Location: caseSearchResult.location,
      latLngLiteral: caseSearchResult.latLngLiteral,
      CurrentLocation: undefined,

    };

    return result;

}

export function fnSortBySortOrderAndRotationPeriodSortOrder(firstAreaShift: AreaShift | RotationRole, secondAreaShift: AreaShift | RotationRole) : number {

    return firstAreaShift.sortOrder - (secondAreaShift.sortOrder || 999);
  
  }

export function getNotificationTypeFromCommentType(commentType: string) : number {

    switch (commentType) {
        case 'patient' :
          return 1;
        
        case 'image' :
          return 2;

        case 'video' :
          return 3;

        default : return -1
        
      }
}

// A function that determines the length of the shift in minutes and returns that as a % of 24 hours
export function getShiftLengthAsPercentageOf24Hours(endTime: number, startTime: number, hourRange: HourRange) : number {

  const shiftLengthInSeconds = Math.round((endTime - startTime) / 1000);

  return shiftLengthInSeconds / ((hourRange.end - hourRange.start + 1) * 60 * 60) * 100;

}

export function getShiftLeftStartingPosition(startTime: number, hourRange: HourRange) : number {

    let midnight = new Date(startTime).setHours(hourRange.start, 0, 0, 0);

    return (((startTime - midnight - 6000) / 1000) / ((hourRange.end - hourRange.start + 1) * 60 * 60) * 100);   

}


export function generateRangeOfHours(start: number, end: number) : HourRange {

  var range = [];

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  range.sort((a,b) => a-b);

  return { start, end, range } as HourRange;

}

export function generateRangeOfQuarterHours(start: number, end: number) : string[] {

  var range:string[] = [];

  for (let i = start; i <= end; i++) {

    let startHour = ("" + i).padStart(2,"0");

    range.push(`${startHour}:00`);
    range.push(`${startHour}:15`);
    range.push(`${startHour}:30`);
    range.push(`${startHour}:45`);
  }

  range.sort((a,b) => (new Date("1970-03-21" + a).getTime()) - (new Date("1970-03-21" + b).getTime()));

  return range;

}