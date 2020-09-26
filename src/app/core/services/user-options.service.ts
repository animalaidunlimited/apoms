import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UserOptionsService{
    homeCoordinates$;
    notifactionDuration:number;
    minimumDate:Date;

    constructor() {}

    getCoordinates() : google.maps.LatLngLiteral{
        if (!this.homeCoordinates$) {
            this.homeCoordinates$ = {
                lat: 24.57127,
                lng: 73.691544,
            };
        }

        return this.homeCoordinates$;
    }

    getNotifactionDuration() : number {
        if (!this.notifactionDuration) {
            this.notifactionDuration = 5;
        }

        return this.notifactionDuration;
    }

    getMinimumDate() : Date{

        if(!this.minimumDate){

            this.minimumDate = new Date('2010-01-01');
        }

        return this.minimumDate;
    }

    //In the future we should allow users to set their own default print template for the emergency card
    getEmergencyCardTemplateId(): number{

        return 7;

    }

    // TODO implement custom debounce time for autocompletes
}
