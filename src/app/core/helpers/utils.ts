import { formatDate } from '@angular/common';

export function getCurrentTimeString() {
    let currentTime = new Date();

    const wn = window.navigator as any;
    let locale = wn.languages ? wn.languages[0] : 'en-GB';
    locale = locale || wn.language || wn.browserLanguage || wn.userLanguage;

    currentTime = new Date(
        currentTime.getTime() + currentTime.getTimezoneOffset(),
    );

    return formatDate(currentTime, 'yyyy-MM-ddTHH:mm', locale);
}

export function getCurrentDateString() {
    let currentTime = new Date();

    const wn = window.navigator as any;
    let locale = wn.languages ? wn.languages[0] : 'en-GB';
    locale = locale || wn.language || wn.browserLanguage || wn.userLanguage;

    currentTime = new Date(
        currentTime.getTime() + currentTime.getTimezoneOffset(),
    );

    return formatDate(currentTime, 'yyyy-MM-dd', locale);
}

// Determine if the given File is an Image (according do its Mime-Type).
export function isImageFile(file: File): boolean {

    return file.type.search(/^image\//i) === 0;
}


// Determine if the given File is an Video (according do its Mime-Type).
export function isVideoFile(file: File): boolean {

    return file.type.search(/^video\//i) === 0;
}