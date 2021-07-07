import { Injectable, NgZone } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { APIService } from '../../../core/services/http/api.service';
import { HttpClient } from '@angular/common/http';
import { OutstandingCaseService } from './outstanding-case.service';
import { TreatmentListService } from '../../treatment-list/services/treatment-list.service';

@Injectable({
    providedIn: 'root'
  })
export class MessagingService extends APIService {


currentMessage = new BehaviorSubject(Boolean(false));
endpoint = 'Messaging';
havePermission = new BehaviorSubject(Boolean(false));
haveReceivedFocus = new BehaviorSubject(Boolean(false));
token = '';

constructor(
    private angularFireMessaging: AngularFireMessaging,
    private authService: AuthService,
    private zone: NgZone,
    private treatmentList: TreatmentListService,
    private outstandingCase: OutstandingCaseService,
    http: HttpClient) {
        super(http);

     angularFireMessaging.onMessage((payload:any) => {
        this.distributeMessage(payload);
     });

    }

    receiveBackgroundMessage(message:string){

        this.distributeMessage(message);

    }

    // TODO - Type this properly as an Angular Fire Message
    distributeMessage(payload:any){

        if(!payload){
            return;
        }

        const message = JSON.parse(JSON.parse(payload.data?.messageData));

        // This is a rescue message, so pass this on to the outstanding-case service
        if(message?.hasOwnProperty('actionStatus')){
            this.outstandingCase.receiveUpdatedRescueMessage(message);
            this.zone.run(() => this.currentMessage.next(payload.data));
        }

        // This is an accept/reject message for treatment list records
        if(message?.hasOwnProperty('messageType')){
            this.treatmentList.receiveAcceptRejectMessage(message);
        }

        if(message?.hasOwnProperty('vehicleLocation')){
            this.outstandingCase.receiveVehicleLocation(message);
        }

        // This is a admission/movement message for treatment list records
        if(Array.isArray(message)){
            this.treatmentList.receiveMovementMessage(message);
        }

    }

    // The window has received focus, so we may need to refresh
    receiveFocus(){

        this.zone.run(() => this.haveReceivedFocus.next(true));

    }

    getPermissionGranted(){

        return this.havePermission;
    }

    // Request permission, if it's granted then subscribe to the required topics.
    // If not granted then emit to let watchers know
    requestPermission() {
        this.angularFireMessaging.requestToken.subscribe(
            (token) => {
                this.zone.run(() => this.havePermission.next(true));

                this.token = token || '';
                this.subscribeToTopics(this.token);

            },
            (err) => {
                this.zone.run(() => this.havePermission.next(false));

            }
        );
    }

    alterPermissionState(currentState:string){

        this.zone.run(() => this.havePermission.next(currentState === 'granted' ? true : false));
    }

    async subscribeToTopics(token:string){

        //TODO save this config against each user so we can allow them to turn the messages on and off.
        //There's no need to have them turned on for everyone


        //TODO here we should call the database and get the list of topics the user wants to subscribe to.

        const topics = [
            "_UPDATING_ASSIGNMENT",
            "_UPDATING_TREATMENT_LIST",
            "_UPDATING_VEHICLE_LOCATION"
        ]

        // send the token to the server and subscribe it to the relevant topics
        const organisation = this.authService.getOrganisationSocketEndPoint();

        let result = [];

        //Go through the list of topics and subscribe to them all
        for(let topic of topics){

            const subscriptionBodyAssignment = {
                token,
                topic: `${organisation}${topic}`
            };

            const subscriptionResult = await this.post(subscriptionBodyAssignment);

            result.push(subscriptionResult);

        }

        return [result];

    }

    getUpdatedRescue(){
        return this.currentMessage;
    }

    async unsubscribe(){

        const organisation = this.authService.getOrganisationSocketEndPoint();

        const unsubscribeAssignment = {
                            unsubscribe: 'true',
                            token:  this.token,
                            topic: `${organisation}_UPDATING_ASSIGNMENT`
                        };

        const assignmentResult = await this.post(unsubscribeAssignment);

        const unsubscribeTreatmentList = {
            unsubscribe: 'true',
            token:  this.token,
            topic: `${organisation}_UPDATING_ASSIGNMENT`
        };

        const treatmentListResult = await this.post(unsubscribeTreatmentList);

        return [assignmentResult, treatmentListResult];

    }
}
