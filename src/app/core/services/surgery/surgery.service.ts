import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from '../http/api.service';

@Injectable({
    providedIn: 'root',
})
export class SurgeryService extends APIService {
    endpoint = 'SurgeryRegister';

    constructor(public http: HttpClient) {
        super(http);
    }

    public async insertSurgery(surgeryData): Promise<any> {
        const request:string = 'surgery';
        if (surgeryData.SurgeryId) {
            return this.put(surgeryData);
        } else {
            return this.post(surgeryData);
        }
    }

    public async getSurgeryBySurgeryId(surgeryId): Promise<any> {
        const request:string = '?SurgeryId=' + surgeryId;
        return this.get(request);
    }

    public getSurgeryByPatientId(patientId: number): Promise<any> {
        const request:string = '?PatientId=' + patientId;
        return this.get(request);
    }
}
