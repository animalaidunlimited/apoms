import { Injectable } from '@angular/core';
import { APIService } from 'src/app/core/services/http/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Patient, PatientCalls, PatientCallModifyResponse, PatientCallResult, Patients } from 'src/app/core/models/patients';
import { MediaItem } from 'src/app/core/models/media';
import { PrintPatient } from 'src/app/core/models/print-templates';

@Injectable({
    providedIn: 'root',
})
export class PatientService extends APIService {


    constructor(http: HttpClient) {
        super(http);
    }

    endpoint = 'Patient';

    public checkTagNumberExists(
        tagNumber: string,
        emergencyCaseId: number,
        patientId: number,
    ): Observable<any> {
        const tagNumberQuery =
            'TagNumber=' +
            tagNumber +
            '&EmergencyCaseId=' +
            emergencyCaseId +
            '&PatientId=' +
            patientId;

        return this.getByField('CheckTagNumberExists', tagNumberQuery).pipe(
            map(value => {
                return value;
            }),
        );
    }

    public getPatientsByEmergencyCaseId(number: number): Observable<Patients> {
        const request = '?emergencyCaseId=' + number;

        return this.getObservable(request).pipe(
            map((response: Patients) => {
                return response;
            })
        );
    }

    public getPatientByPatientId(patientId: number): Observable<Patient> {
        const request = '?patientId=' + patientId;

        return this.getObservable(request).pipe(
            map((response: Patient) => {
                return response;
            }),
        );
    }

    public getPrintPatientByPatientId(patientId: number): Observable<PrintPatient> {
        const request = '?printPatientId=' + patientId;

        return this.getObservable(request).pipe(
            map((response: PrintPatient) => {
                return response;
            }),
        );
    }

    public getPrintPatientsByEmergencyCaseId(emergencyCaseId: number): Observable<PrintPatient[]> {
        const request = '?printEmergencyCaseId=' + emergencyCaseId;

        return this.getObservable(request).pipe(
            map((response: PrintPatient[]) => {
                return response;
            }),
        );
    }

    public async updatePatientStatus(patient: any) {
        return await this.put(patient)
            .then(data => {
                return data;
            })
            .catch(error => {
                console.log(error);
            });
    }

    public getPatientCallsByPatientId(
        patientId: number,
    ): Observable<PatientCalls> {
        const request = '/PatientCalls?patientId=' + patientId;

        return this.getObservable(request).pipe(
            map((response: PatientCalls) => {
                return response;
            }),
        );
    }

    public async savePatientCalls(
        patientCalls: PatientCalls,
    ): Promise<PatientCallModifyResponse[]> {
        const response: PatientCallModifyResponse[] = [];

        for (const call of patientCalls.calls) {
            if (call.patientCallId && call.updated) {
                call.patientId = patientCalls.patientId;

                await this.put(call)
                    .then((data: PatientCallResult) => {
                        response.push({
                            position: call.position,
                            results: data,
                        });
                    })
                    .catch(error => {
                        console.log(error);
                    });
            } else if (!call.patientCallId && call.updated) {
                call.patientId = patientCalls.patientId;

                await this.post(call)
                    .then((data: PatientCallResult) => {
                        response.push({
                            position: call.position,
                            results: data,
                        });
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
        }

        return response;
    }

    public async savePatientMedia(mediaItem: MediaItem){

        return await this.put(mediaItem)
            .then(data => {
                return data;
            })
            .catch(error => {
                console.log(error);
            });

    }

    public getPatientMediaItemsByPatientId(
        patientId: number,
    ): Observable<any> {
        const request = '/PatientMediaItems?patientId=' + patientId;

        return this.getObservable(request).pipe(
            map((response: any) => {

                return response
            }),
        );
    }

}
