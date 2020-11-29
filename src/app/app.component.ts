import { Component, OnInit } from '@angular/core';
import { MessagingService } from './modules/emergency-register/services/messaging.service';
import { MAT_DATE_LOCALE} from '@angular/material/core';
import { OutstandingCaseService } from './modules/emergency-register/services/outstanding-case.service';
import { PrintTemplateService } from './modules/print-templates/services/print-template.service';
import { BehaviorSubject } from 'rxjs';
import { EmergencyRegisterTabBarService } from './modules/emergency-register/services/emergency-register-tab-bar.service';
import { PromptUpdateService } from './core/services/update-service.service';
import { HttpClient } from '@angular/common/http';
import { SharedMediaPackage } from './core/models/media';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [
        // TODO alter this to load from the user settings
        {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
      ]
})
export class AppComponent implements OnInit{

    isPrinting:BehaviorSubject<boolean>;
    message:BehaviorSubject<any>;
    title = 'apoms';

    constructor(
        private messagingService: MessagingService,
        private printService: PrintTemplateService,
        private emergencyTabBar: EmergencyRegisterTabBarService,
        private updateService: PromptUpdateService,
        private http: HttpClient,
        private outstandingCaseService: OutstandingCaseService
        ) {
            this.isPrinting = this.printService.getIsPrinting();
            this.message = this.messagingService.currentMessage;

            window.addEventListener('beforeunload', () => {

                this.messagingService.unsubscribe();
             });

             // If we've just received focus then we may need to refresh the outstanding case board because
             // changes might have happened while we were away
            window.addEventListener('visibilitychange', () => {
                if(!document.hidden){
                    this.outstandingCaseService.receiveFocus();
                }
            });
     }

    ngOnInit() {

        this.messagingService.requestPermission();

        setTimeout(() => {

            this.http.get('/assets/images/aau_logo.jpg', { responseType: 'blob' }).subscribe(res => {

                const newFile = new File([res], 'aau_logo.jpg', { type: 'image/jpg' });

        const event:SharedMediaPackage = {
            message: 'newMedia',
            image: [newFile],
            video: []
        };

        this.emergencyTabBar.receiveSharedMediaItem(event);

      });

        }, 5000)

        // Set up to receive messages from the service worker when the app is in the background.
        navigator.serviceWorker.addEventListener('message', (event:MessageEvent) => {

            console.log('Message posted');
            console.log(event);

            if(event.data.hasOwnProperty('image')){

                console.log('Sharing media item');
                this.emergencyTabBar.receiveSharedMediaItem(event.data);

            }

            if(event.hasOwnProperty('data')){

                this.messagingService.receiveBackgroundMessage(event.data?.firebaseMessaging?.payload);


           }

            });

        // Watch the status of permissions to watch for them being revoked. Because we'll need to
        // tell the user to refresh.
        if ('permissions' in navigator) {
            navigator.permissions.query({ name: 'notifications' }).then( (notificationPerm) => {
                notificationPerm.onchange = () => {

                    this.messagingService.alterPermissionState(notificationPerm.state);
                };
            });
            }

      }

}
