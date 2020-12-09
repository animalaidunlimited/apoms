import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';

@Injectable({
    providedIn: 'root',
})
export class UserOptionsService{

    userName!: any;
    token!:any;

    homeCoordinates$ = {
        lat: 24.57127,
        lng: 73.691544,
    };
    notifactionDuration = 3;
    minimumDate = new Date('2010-01-01');

    constructor(private storage: StorageService) {}

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

    // In the future we should allow users to set their own default print template for the emergency card
    getEmergencyCardTemplateId(): number{

        return 7;

    }

    getUserName(): string {
        if(this.userName) {
            return this.userName;
        }
        else {
            this.token = this.storage.read('AUTH_TOKEN');
            let tokenData: any = window.atob(this.token.split('.')[1]);
            tokenData = JSON.parse(tokenData);
            return tokenData.username;
        }
    }

    // TODO implement custom debounce time for autocompletes
}
