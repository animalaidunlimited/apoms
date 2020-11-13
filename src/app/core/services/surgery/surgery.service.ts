import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from '../http/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SurgeryRecord } from '../../models/Surgery-details';

@Injectable({
    providedIn: 'root',
})
export class SurgeryService extends APIService {
    [x: string]: any;
    endpoint = 'SurgeryRegister';

    constructor(public http: HttpClient) {
        super(http);
    }

    public async saveSurgery(surgeryData:any): Promise<any> {
        const request = 'surgery';
        if (surgeryData.SurgeryId) {
            return await this.put(surgeryData);
        } else {
            return await this.post(surgeryData);
        }
    }

    public async getSurgeryBySurgeryId(surgeryId: number): Promise<any> {
        const request:string = '?SurgeryId=' + surgeryId;
        return await this.get(request);
    }

    public getSurgeryByPatientId(patientId: number): Promise<any> {
        const request:string = '?PatientId=' + patientId;
        return this.get(request);
    }

    public getSurgeryBySurgeryDate(surgeryDate: string | Date): Observable<SurgeryRecord[]> {
        const request:string = '?SurgeryDate=' + surgeryDate;

        return this.getObservable(request).pipe(
            map((response:SurgeryRecord[]) => {
                return response;
            }),
        );

    }

}
