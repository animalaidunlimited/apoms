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

    public async insertSurgery(surgerydata): Promise<any> {
        const request = 'surgery';
        console.log(surgerydata);

        if (surgerydata.SurgeryId) {
            return this.put(surgerydata);
        } else {
            return this.post(surgerydata);
        }
    }

    public async getSurgeryBySurgeryId(surgeryId): Promise<any> {
        const request = '?SurgeryId=' + surgeryId;

        return this.get(request);
    }

    public getSurgeryByPatientId(patientId: number): Promise<any> {
        const request = '?PatientId=' + patientId;
        return this.get(request);
    }
}
