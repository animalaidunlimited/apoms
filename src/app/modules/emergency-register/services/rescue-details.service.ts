import { Injectable } from '@angular/core';
import { APIService } from 'src/app/core/services/http/api.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {  map } from 'rxjs/operators';
import { RescueDetailsParent } from 'src/app/core/models/responses';
import { OutstandingAssignment, OutstandingCaseResponse, UpdateResponse } from 'src/app/core/models/outstanding-case';
import { Vehicle } from 'src/app/core/models/vehicle';


@Injectable({
    providedIn: 'root',
})
export class RescueDetailsService extends APIService {
    constructor(http: HttpClient) {
        super(http);
    }

    endpoint = 'RescueDetails';
    redirectUrl = '';

    outstandingRescues$: Observable<OutstandingCaseResponse> | undefined;

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



    getOutstandingRescues(): Observable<OutstandingAssignment[]> {
        const request = '/OutstandingRescues';

            return this.getObservable(request).pipe(
                map(response => {
                    return response;
                }),
            );



    }

    getVehicleListByAssignmentTime(ambulanceAssignmentTime: string) : Observable<Vehicle[]> {
        const request = '?vehicleAssignmentTime=' + ambulanceAssignmentTime;

        return this.getObservable(request).pipe(
            map(response => {
                return response;
            }),
        );
    }
}
