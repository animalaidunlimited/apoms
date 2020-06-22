import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Caller, Callers } from '../../models/responses';
import { APIService } from '../../services/http/api.service';

@Injectable({
    providedIn: 'root',
})
export class CallerDetailsService extends APIService {
    constructor(http: HttpClient) {
        super(http);
    }

    endpoint = 'Caller';

    public getCallerByNumber(number: string): Observable<any> {
        const request = '?number=' + number;

        return this.getObservable(request).pipe(
            map((response: Callers) => {
                return response;
            }),
        );
    }

    public getCallerByEmergencyCaseId(number: string): Observable<any> {
        const request = '?emergencyCaseId=' + number;

        return this.getObservable(request).pipe(
            map((response: Caller) => {
                return response;
            }),
        );
    }
}
