import { Component, OnInit } from '@angular/core';
import { PrintTemplateService } from '../../print-templates/services/print-template.service';
import { EmergencyRegisterTabBarService } from '../services/emergency-register-tab-bar.service';
import { MessagingService } from '../services/messaging.service';
import { OutstandingCaseService } from '../services/outstanding-case.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'emergency-register-page',
    templateUrl: './emergency-register-page.component.html',
    styleUrls: ['./emergency-register-page.component.scss'],
})
export class EmergencyRegisterPageComponent implements OnInit {


    message:BehaviorSubject<any>;

    constructor(
        private messagingService: MessagingService,
        private emergencyTabBar: EmergencyRegisterTabBarService,
        private outstandingCaseService: OutstandingCaseService,
        private printService: PrintTemplateService
        ) {

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

        this.printService.initialisePrintTemplates();

        this.messagingService.requestPermission();

        // Set up to receive messages from the service worker when the app is in the background.
        navigator.serviceWorker.addEventListener('message', (event:MessageEvent) => {

            if(event.data?.image || event.data?.video){

                this.emergencyTabBar.receiveSharedMediaItem(event.data);
            }

            if(event?.data){
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
