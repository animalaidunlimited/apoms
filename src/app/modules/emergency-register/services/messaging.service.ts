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

    angularFireMessaging.onMessage((payload) => this.distributeMessage(payload));

    }

    testing() {
        const message= {
            data: {
              messageData: '"{\\"latitude\\": 24.58257090, \\"location\\": \\"Subhash Nagar, Udaipur, Rajasthan 313001, India\\", \\"patients\\": [655504], \\"staff1Id\\": 7, \\"staff2Id\\": \\"10\\", \\"longitude\\": 73.71909950, \\"callerName\\": \\"Arpit\\", \\"rescueTime\\": \\"2020-11-24 11:58:00.000000\\", \\"animalTypes\\": [\\"Dog\\"], \\"callDateTime\\": \\"2020-08-07 10:48:40.000000\\", \\"callerNumber\\": \\"8769184667\\", \\"rescueStatus\\": 4, \\"staff1Colour\\": \\"#ff0000\\", \\"staff2Colour\\": \\"\\", \\"callOutcomeId\\": null, \\"isLargeAnimal\\": 0, \\"latLngLiteral\\": {\\"lat\\": 24.58257090, \\"lng\\": 73.71909950}, \\"ambulanceAction\\": \\"Release\\", \\"emergencyCaseId\\": 736254, \\"emergencyCodeId\\": 3, \\"emergencyNumber\\": 4561, \\"staff1Abbreviation\\": \\"AG\\", \\"staff2Abbreviation\\": \\"10\\", \\"ambulanceArrivalTime\\": \\"2020-11-24 11:58:00.000000\\"}"'
            },
            topic: 'aau_UPDATING_ASSIGNMENT'
          };

        this.distributeMessage(message);
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

        console.log(message);

        // This is a rescue message, so pass this on to the outstanding-case service
        if(message.hasOwnProperty('rescueStatus')){
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
            topic: `${organisation}_UPDATING_RESCUE`
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
                            topic: `${organisation}_UPDATING_RESCUE`
                        };

        const result = await this.post(unsubscribe);

        return result;

    }
}
