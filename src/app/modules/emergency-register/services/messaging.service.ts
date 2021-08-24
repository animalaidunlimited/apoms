import { Injectable, NgZone } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { APIService } from '../../../core/services/http/api.service';
import { HttpClient } from '@angular/common/http';
import { OutstandingCaseService } from './outstanding-case.service';
import { TreatmentListService } from '../../treatment-list/services/treatment-list.service';
import { OrganisationOptionsService } from 'src/app/core/services/organisation-option/organisation-option.service';

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
    private zone: NgZone,
    private treatmentList: TreatmentListService,
    private outstandingCase: OutstandingCaseService,
    private organisationOptions: OrganisationOptionsService,
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

        // send the token to the server and subscribe it to the relevant topics
        const organisation = this.organisationOptions.getOrganisationSocketEndPoint();

        const subscriptionBodyAssignment = {
            token,
            topic: `${organisation}_UPDATING_ASSIGNMENT`
        };

        const assignmentResult = await this.post(subscriptionBodyAssignment);

        const subscriptionBodyTreatmentList = {
            token,
            topic: `${organisation}_UPDATING_TREATMENT_LIST`
        };

        const treatmentListResult = await this.post(subscriptionBodyTreatmentList);

        return [assignmentResult, treatmentListResult];

    }

    getUpdatedRescue(){
        return this.currentMessage;
    }

    async unsubscribe(){

        const organisation = this.organisationOptions.getOrganisationSocketEndPoint();

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
