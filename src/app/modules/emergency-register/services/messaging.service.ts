import { Injectable, NgZone } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { APIService } from '../../../core/services/http/api.service';
import { HttpClient } from '@angular/common/http';
import { OutstandingCaseService } from './outstanding-case.service';

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
    private outstandingCase: OutstandingCaseService,
    http: HttpClient) {
        super(http);

     angularFireMessaging.onMessage((payload) => this.distributeMessage('angularFireMessaging.onMessage', payload));

    }

    receiveBackgroundMessage(message:string){
        this.distributeMessage('receiveBackgroundMessage', message);

    }

    // TODO - Type this properly as an Angular Fire Message
    distributeMessage(source:string, payload:any){

        console.log(source);

        if(!payload){
            return;
        }

        const message = JSON.parse(JSON.parse(payload.data?.messageData));

        // This is a rescue message, so pass this on to the outstanding-case service
        if(message.hasOwnProperty('actionStatus')){
            this.outstandingCase.receiveUpdatedRescueMessage(message);
            this.zone.run(() => this.currentMessage.next(payload.data));

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
        const organisation = this.authService.getOrganisationSocketEndPoint();

        const subscriptionBody = {
            token,
            topic: `${organisation}_UPDATING_ASSIGNMENT`
        };

        const result = await this.post(subscriptionBody);

        return result;

    }

    getUpdatedRescue(){
        return this.currentMessage;
    }

    async unsubscribe(){

        const organisation = this.authService.getOrganisationSocketEndPoint();

        const unsubscribe = {
                            unsubscribe: 'true',
                            token:  this.token,
                            topic: `${organisation}_UPDATING_ASSIGNMENT`
                        };

        const result = await this.post(unsubscribe);

        return result;

    }
}
