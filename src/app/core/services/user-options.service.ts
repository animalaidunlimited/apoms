import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UserOptionsService{
    homeCoordinates$;
    notifactionDuration:number;
    minimumDate:Date;

    constructor() {}

    getCoordinates() {
        if (!this.homeCoordinates$) {
            this.homeCoordinates$ = {
                latitude: 24.57127,
                longitude: 73.691544,
            };
        }

        return this.homeCoordinates$;
    }

    getNotifactionDuration() {
        if (!this.notifactionDuration) {
            this.notifactionDuration = 5;
        }

        return this.notifactionDuration;
    }

    getMinimumDate(){

        if(!this.minimumDate){

            this.minimumDate = new Date("2010-01-01");
        }

        return this.minimumDate;
    }

    // TODO implement custom debounce time for autocompletes
}
