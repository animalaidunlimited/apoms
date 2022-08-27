import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessOnlyResponse } from '../../models/responses';
import { UserAccountDetails, UserPreferences } from '../../models/user';
import { APIService } from '../http/api.service';
import { StorageService } from '../storage/storage.service';

@Injectable({
    providedIn: 'root',
})
export class UserOptionsService extends APIService{

    endpoint = 'UserAdmin';

    userName!: any;
    token!:any;

    userDetails: BehaviorSubject<UserAccountDetails> = new BehaviorSubject<UserAccountDetails>(this.getEmtpyUserDetails());

    homeCoordinates$ = {
        lat: 24.57127,
        lng: 73.691544,
    };

    notificationDuration = 3;

    minimumDate = new Date('2018-01-01');

    constructor(
        public http: HttpClient,
        private storage: StorageService
        ) {
            super(http);

            const userDetails = this.storage.read('UserDetails');

            userDetails ? this.userDetails.next((userDetails as any) as UserAccountDetails) : this.userDetails.next(this.getEmtpyUserDetails());
    }

    private getEmtpyUserDetails() : UserAccountDetails {

        return {
            initials: "NA",
            fullname: "Please logout and back in again",
            preferences: { clearSearchOnTabReturn : false }
        }

    }

    getCoordinates() : google.maps.LatLngLiteral{
        if (!this.homeCoordinates$) {
            this.homeCoordinates$ = {
                lat: 24.57127,
                lng: 73.691544,
            };
        }

        return this.homeCoordinates$;
    }

    getNotificationDuration() : number {
        if (!this.notificationDuration) {
            this.notificationDuration = 5;
        }

        return this.notificationDuration;
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

    public getUserName(): string {
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

    public setUserName(username: string){
        this.userName = username
    }

    public saveUserDetails(userDetails: UserAccountDetails) : void {

        this.storage.save('UserDetails', userDetails);

        this.userDetails.next(userDetails);

    }

    public getUserAccountDetails() : BehaviorSubject<UserAccountDetails> {

        return this.userDetails;
    }

    public getUserPreferences() : Observable<UserPreferences> {

        return this.userDetails.pipe(map(userDetails => userDetails.preferences));

    }

    public async updateUserPreferences(userPreferences: UserPreferences) : Promise<SuccessOnlyResponse> {

        const endpoint = '/UpdateUserPreferences';

        const requestBody = {
          userPreferences,
          userId : this.storage.read('UserId')
        }

        const userDetails = this.userDetails.value;

        userDetails.preferences = userPreferences;

        this.userDetails.next(userDetails);

        this.storage.save('UserDetails', userDetails);

        return await this.putSubEndpoint(endpoint, requestBody);
      }

    // TODO implement custom debounce time for autocomplete
}
