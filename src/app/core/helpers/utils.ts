import { formatDate } from '@angular/common';
import { UUID } from 'angular2-uuid';
import { DriverAssignment } from '../models/driver-view';
import { OutstandingAssignment } from '../models/outstanding-case';
import { SearchResponse } from '../models/responses';

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