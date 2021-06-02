import { Component, OnInit } from '@angular/core';
import { MAT_DATE_LOCALE} from '@angular/material/core';
import { BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';
import { LocationTrackingService } from './core/services/location-tracking/location-tracking.service';
import { EmergencyRegisterTabBarService } from './modules/emergency-register/services/emergency-register-tab-bar.service';
import { MessagingService } from './modules/emergency-register/services/messaging.service';
import { PrintTemplateService } from './modules/print-templates/services/print-template.service';

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

    isPrinting!:BehaviorSubject<boolean>;
    title = 'apoms';

    constructor(
        private printService: PrintTemplateService,
        private authService: AuthService,
        private messagingService: MessagingService,
        private locationTracker: LocationTrackingService,
        private emergencyTabBar: EmergencyRegisterTabBarService
    ) {



    }

    ngOnInit() {


        // this.locationTracker.logLocation();



        this.authService.loggedIn.subscribe(loggedIn => {

            if(loggedIn){

                this.isPrinting = this.printService.getIsPrinting();

                window.addEventListener('beforeunload', () => {
                    this.messagingService.unsubscribe();
                 });

                 this.printService.initialisePrintTemplates();

                 this.messagingService.requestPermission();

                 // Set up to receive messages from the service worker when the app is in the background.
                 navigator.serviceWorker.addEventListener('message', (event:MessageEvent) => {

                    if(event.data?.image || event.data?.video){

                        this.emergencyTabBar.receiveSharedMediaItem(event.data);
                    }

                    if(event?.data?.messageData?.staff1){
                        this.messagingService.receiveBackgroundMessage(event.data?.firebaseMessaging?.payload);
                    }

                 });

            }
            else {

            }


        });

    }

}
