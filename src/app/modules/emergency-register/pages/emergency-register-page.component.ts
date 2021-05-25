import { Component, OnInit } from '@angular/core';
import { PrintTemplateService } from '../../print-templates/services/print-template.service';
import { EmergencyRegisterTabBarService } from '../services/emergency-register-tab-bar.service';
import { MessagingService } from '../services/messaging.service';
import { OutstandingCaseService } from '../services/outstanding-case.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'emergency-register-page',
    templateUrl: './emergency-register-page.component.html',
    styleUrls: ['./emergency-register-page.component.scss'],
})
export class EmergencyRegisterPageComponent implements OnInit {


    message:BehaviorSubject<any>;

    constructor(
        private messagingService: MessagingService,
        private outstandingCaseService: OutstandingCaseService
        ) {

            this.message = this.messagingService.currentMessage;

             // If we've just received focus then we may need to refresh the outstanding case board because
             // changes might have happened while we were away
            window.addEventListener('visibilitychange', () => {
                if(!document.hidden){
                    this.outstandingCaseService.receiveFocus();
                }
            });

        }

    ngOnInit() {

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
