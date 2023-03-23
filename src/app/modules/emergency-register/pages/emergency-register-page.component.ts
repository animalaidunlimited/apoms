import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessagingService } from '../services/messaging.service';
import { OutstandingCaseService } from '../services/outstanding-case.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { CaseService } from '../services/case.service';
import { EmergencyRegisterTabBarService } from '../services/emergency-register-tab-bar.service';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'emergency-register-page',
    templateUrl: './emergency-register-page.component.html',
    styleUrls: ['./emergency-register-page.component.scss'],
})
export class EmergencyRegisterPageComponent implements OnInit, OnDestroy {

    private ngUnsubscribe = new Subject();

    message:BehaviorSubject<any>;

    constructor(
        private messagingService: MessagingService,
        route: ActivatedRoute,
        private outstandingCaseService: OutstandingCaseService,
        private caseService: CaseService,
        private tabBar: EmergencyRegisterTabBarService
        ) {

            this.message = this.messagingService.currentMessage;

             // If we've just received focus then we may need to refresh the outstanding case board because
             // changes might have happened while we were away
            window.addEventListener('visibilitychange', () => {
                if(!document.hidden){
                    this.outstandingCaseService.receiveFocus();
                }
            });

            route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
                if(route.snapshot.params.emergencyNumber){
    
                    const searchTerm = `ec.EmergencyNumber="${route.snapshot.params.emergencyNumber}"`;
    
                this.caseService.searchCases(searchTerm).pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
                    this.tabBar.addTab(result);
                });
    
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

    ngOnDestroy(): void {
        
        this.ngUnsubscribe.next();
    }
}
