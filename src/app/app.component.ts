import { Component, OnInit } from '@angular/core';
import { MessagingService } from './modules/emergency-register/services/messaging.service';
import { MAT_DATE_LOCALE} from '@angular/material/core';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [
        //TODO alter this to load from the user settings
        {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
      ]
})
export class AppComponent implements OnInit{
    // test
    title:string = 'apoms';
    message;

    constructor(
        private messagingService: MessagingService) {

            window.addEventListener("beforeunload", () => {

                this.messagingService.unsubscribe();
             });

            window.addEventListener("visibilitychange", (change) => {
                if(!document.hidden){
                    this.messagingService.receiveFocus();
                }
            });
     }

    ngOnInit() {
        this.messagingService.requestPermission();
        this.message = this.messagingService.currentMessage;

        //Set up to receive messages from the service worker when the app is in the background.
        navigator.serviceWorker.addEventListener('message', (event) => {

            if(event.data){

                let updatedRescue = {messageData: event.data};

                this.messagingService.receiveRescueUpdate(JSON.stringify(updatedRescue));

            }

            });

        //Watch the status of permissions to watch for them being revoked. Because we'll need to
        //tell the user to refresh.
        if ('permissions' in navigator) {
            navigator.permissions.query({ name: 'notifications' }).then( (notificationPerm) => {
                notificationPerm.onchange = () => {

                    this.messagingService.alterPermissionState(notificationPerm.state);
                };
            });
            }

      }
}
