import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import {
    OutstandingCaseResponse,
    OutstandingRescue,
} from 'src/app/core/models/outstanding-case';

@Injectable({
    providedIn: 'root',
})
export class BoardSocketService {
    endpoint = 'EventEmitter';

    room: string;

    eventSource: EventSource;

    public rescueStreamSubject: Subject<any>;

    constructor(private authService: AuthService, private zone: NgZone) {}

    async initialiseConnection() {
        this.room = await this.authService.getOrganisationSocketEndPoint();

        const eventName = `${this.room}_UPDATING_RESCUE`;
    }

    getUpdatedRescues(): Observable<OutstandingRescue> {
        return Observable.create(observer => {
            this.eventSource = new EventSource(
                '/EventEmitter/AAU_UPDATING_RESCUE',
                { withCredentials: true },
            );

            this.eventSource.onmessage = event => {
                this.zone.run(() => {
                    observer.next(JSON.parse(JSON.parse(event.data)));
                });
            };

            this.eventSource.onerror = error => {
                // TODO make this into a toast..
                console.log(
                    'looks like the best thing to do is to do nothing: ' +
                        error,
                );
            };
        });
    }
}
