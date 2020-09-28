import { Component, OnInit } from '@angular/core';
import { MessagingService } from './modules/emergency-register/services/messaging.service';
import { MAT_DATE_LOCALE} from '@angular/material/core';
import { OutstandingCaseService } from './modules/emergency-register/services/outstanding-case.service';
import { PrintTemplateService } from './modules/print-templates/services/print-template.service';
import { BehaviorSubject } from 'rxjs';


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

    isPrinting:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    message:BehaviorSubject<any>;
    title:string = 'apoms';




    constructor(
        private messagingService: MessagingService,
        private printService: PrintTemplateService,
        private outstandingCaseService: OutstandingCaseService
        ) {

            window.addEventListener("beforeunload", () => {

                this.messagingService.unsubscribe();
             });

             //If we've just received focus then we may need to refresh the outstanding case board because
             //changes might have happened while we were away
            window.addEventListener("visibilitychange", () => {
                if(!document.hidden){
                    this.outstandingCaseService.receiveFocus();
                }
            });
     }

    ngOnInit() {
        this.messagingService.requestPermission();
        this.message = this.messagingService.currentMessage;
        this.isPrinting = this.printService.getIsPrinting()



        //Set up to receive messages from the service worker when the app is in the background.
        navigator.serviceWorker.addEventListener('message', (event:MessageEvent) => {

            if(event.data){

                // this.messagingService.receiveBackgroundMessage(event.data.firebaseMessaging.payload);

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
