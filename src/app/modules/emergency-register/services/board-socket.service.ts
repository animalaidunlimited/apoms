import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs'
import { AuthService } from 'src/app/auth/auth.service';
import { APIService } from '../../../core/services/http/api.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
  })
export class MessagingService extends APIService {


currentMessage = new BehaviorSubject(null);
endpoint:string = "Messaging";
havePermission = new BehaviorSubject(null);
haveReceivedFocus = new BehaviorSubject(null);
token;

constructor(private angularFireMessaging: AngularFireMessaging,
    private authService: AuthService,
    http: HttpClient) {
        super(http);

        angularFireMessaging.onMessage((payload) => {
            this.currentMessage.next(payload.data);
          });
    }

    receiveRescueUpdate(message:string){

        this.currentMessage.next(message);
    }

    //The window has received focus, so we may need to refresh
    receiveFocus(){

        this.haveReceivedFocus.next(true);

    }

    getPermissionGranted(){

        return this.havePermission;
    }

    //Request permission, if it's granted then subscribe to the required topics.
    //If not granted then emit to let watchers know
    requestPermission() {
        this.angularFireMessaging.requestToken.subscribe(
            (token) => {

                this.havePermission.next(true);
                this.token = token;
                this.subscribeToTopics(token);

            },
            (err) => {
                this.havePermission.next(false);

            }
        );
    }

    alterPermissionState(currentState:string){

        this.havePermission.next(currentState === "granted" ? true : false);
    }

    async subscribeToTopics(token){

        //send the token to the server and subscribe it to the relevant topics
        let organisation = this.authService.getOrganisationSocketEndPoint();

        let subscriptionBody = {
            token: token,
            topic: `${organisation}_UPDATING_RESCUE`
        }

        let result = await this.post(subscriptionBody);

        return result;

    }

    getUpdatedRescue(){
        return this.currentMessage;
    }

    async unsubscribe(){

        let organisation = this.authService.getOrganisationSocketEndPoint();

        let unsubscribe = {
                            unsubscribe: "true",
                            token:  this.token,
                            topic: `${organisation}_UPDATING_RESCUE`
                        };

        let result = await this.post(unsubscribe);

        return result;

    }
}
