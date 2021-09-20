import { formatDate } from '@angular/common';
import { UUID } from 'angular2-uuid';

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