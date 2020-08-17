import { Injectable } from '@angular/core';
import { APIService } from 'src/app/core/services/http/api.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RescueDetailsParent } from 'src/app/core/models/responses';
import { OutstandingCaseResponse, UpdatedRescue, UpdateResponse } from 'src/app/core/models/outstanding-case';

@Injectable({
    providedIn: 'root',
})
export class RescueDetailsService extends APIService {
    constructor(http: HttpClient) {
        super(http);
    }

    endpoint = 'RescueDetails';
    redirectUrl: string;

    outstandingRescues$: Observable<OutstandingCaseResponse>;

    public getRescueDetailsByEmergencyCaseId(
        emergencyCaseId: number,
    ): Observable<RescueDetailsParent> {
        const request = '?emergencyCaseId=' + emergencyCaseId;

        return this.getObservable(request).pipe(
            map((response: RescueDetailsParent) => {
                return response;
            }),
        );
    }

    public async updateRescueDetails(rescueDetails: UpdateResponse): Promise<UpdateResponse> {
        return await this.put(rescueDetails);
    }

    getOutstandingRescues(): Observable<OutstandingCaseResponse> {
        const request = '/OutstandingRescues';

        if (!this.outstandingRescues$) {
            this.outstandingRescues$ = this.getObservable(request).pipe(
                map(response => {
                    return response;
                }),
            );
        }

        return this.outstandingRescues$;

        // let observable:Observable<OutstandingCaseResponse> = new Observable(observer => {

        //   this.socket.on('OUTSTANDING_RESCUES', (data: any) => {

        //     //TODO fix this. For some reason these needs to be parsed instead of being able to
        //     //cast directly to the type
        //     observer.next(JSON.parse(data));
        //   });
        //   // return () => {
        //   //   this.socket.disconnect();
        //   // };
        // })
        // return observable;
    }
}
