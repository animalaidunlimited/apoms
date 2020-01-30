import { formatDate } from '@angular/common';

export function getCurrentTimeString()
{
  let currentTime = new Date();

  
  const wn = window.navigator as any;
  let locale = wn.languages ? wn.languages[0] : "en-US";
  locale = locale || wn.language || wn.browserLanguage || wn.userLanguage;

  currentTime = new Date(currentTime.getTime() + currentTime.getTimezoneOffset());

  return formatDate(currentTime, "yyyy-MM-ddTHH:mm", locale);
}

