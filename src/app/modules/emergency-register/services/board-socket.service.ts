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


constructor(private angularFireMessaging: AngularFireMessaging,
    private authService: AuthService,
    http: HttpClient) {
        super(http);

        angularFireMessaging.onMessage((payload) => {
            // console.log(payload);
            this.currentMessage.next(payload.data);
          })
    }


    requestPermission() {
        this.angularFireMessaging.requestToken.subscribe(
            (token) => {
                console.log(token);

                this.subscribeToTopics(token);

            },
            (err) => {
                console.error('Unable to get permission to notify.', err);
            }
        );
    }

    async subscribeToTopics(token){

        //send the token to the server and subscribe it to the relevant topics
        let organisation = this.authService.getOrganisationSocketEndPoint();

        let subscriptionBody = {
            token: token,
            topic: `${organisation}_UPDATING_RESCUE`
        }

        let result = await this.post(subscriptionBody)

        console.log(result);

    }


    getUpdatedRescue(){
        return this.currentMessage;
    }
}