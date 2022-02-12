import { Injectable } from '@angular/core';
import { APIService } from 'src/app/core/services/http/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Patient, PatientCalls, PatientCallModifyResponse, PatientCallResult, Patients,
    CrueltyReport, CrueltyReportResult, PatientOutcome, PatientOutcomeResponse, UpdatePatientDetails, PriorityObject } from 'src/app/core/models/patients';
import { PrintPatient } from 'src/app/core/models/print-templates';
import { SuccessOnlyResponse } from '../../models/responses';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';

@Injectable({
    providedIn: 'root',
})
export class PatientService extends APIService {

    constructor(
        http: HttpClient,
        private fb: FormBuilder) {
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

    public getPatientsByEmergencyCaseId(emergencyCaseId: number): Observable<Patients> {
        const request = '?emergencyCaseId=' + emergencyCaseId;

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

    public async updatePatientDetails(patientDetails: Patient | UpdatePatientDetails) {

        return await this.put(patientDetails)
            .then(data => {
                return data;
            })
            .catch(error => {
                console.log(error);
            });
    }

    public getCrueltyForm(
        patientId: number,
    ): Observable<CrueltyReport> {
        const request = '/CrueltyReport?patientId=' + patientId;

        return this.getObservable(request).pipe(
            map((response: CrueltyReport) => {
                return response;
            }),
        );
    }

    public async saveCrueltyForm(crueltyForm: CrueltyReport) : Promise<CrueltyReportResult> {

        if(crueltyForm.crueltyReportId){

            return await this.put(crueltyForm)
            .then(data => {
                return data;
            })
            .catch(error => {
                console.log(error);
            });

        }
        else{

            return await this.post(crueltyForm)
            .then(data => {
                return data;
            })
            .catch(error => {
                console.log(error);
            });

        }


    }

    public getPatientCallerInteractionByPatientId(
        patientId: number,
    ): Observable<PatientCalls> {
        const request = '/PatientCallerInteractions?patientId=' + patientId;

        return this.getObservable(request).pipe(
            map((response: PatientCalls) => {
                return response;
            }),
        );
    }

    public async savePatientCallerInteractions(
        patientCalls: PatientCalls,
    ): Promise<PatientCallModifyResponse[]> {

        const response:PatientCallModifyResponse[] = [];

        for (const call of patientCalls.calls) {
            if (call.patientCallerInteractionId && call.updated) {
                call.patientId = patientCalls.patientId;

                await this.put(call)
                    .then((data: PatientCallResult) => {
                        if(data.success === -1) {
                            response.push(
                                {position: 0,
                                results: {
                                    patientCallerInteractionId: 0,
                                    success: 0
                                },
                                success: -1});
                        }
                        else{
                            response.push({
                                position: 0,
                                results: data,
                                success: 1
                            });
                        }
                    })
                    .catch(error => {
                        console.log(error);

                    });
            } else if (!call.patientCallerInteractionId && call.updated) {
                call.patientId = patientCalls.patientId;

                await this.post(call)
                    .then((data: PatientCallResult) => {
                        if(data.success === -1) {
                            response.push(
                                {position: 0,
                                results: {
                                    patientCallerInteractionId: 0,
                                    success: 0
                                },
                                success: -1});
                        }
                        else{
                            response.push({
                                position: call.position,
                                results: data,
                                success: 1
                            });
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
        }

        return response;
    }



    public getPatientOutcomeForm(
        patientId: number,
    ): Observable<PatientOutcome> {
        const request = '/PatientOutcomeDetails?patientId=' + patientId;

        return this.getObservable(request).pipe(
            map((response: PatientOutcome) => {
                return response;
            }),
        );
    }

    public async savePatientOutcomeForm(outcomeForm: PatientOutcome) : Promise<PatientOutcomeResponse> {

        if(outcomeForm.patientOutcomeDetailsId){

            return await this.put(outcomeForm)
            .then(data => {
                return data;
            })
            .catch(error => {
                console.log(error);
            });

        }
        else{

            return await this.post(outcomeForm)
            .then(data => {
                return data;
            })
            .catch(error => {
                console.log(error);
            });

        }

    }


    public async updatePatientPriority(priorityObject: PriorityObject): Promise<SuccessOnlyResponse> {
        return await this.put(priorityObject)
            .then(data => {
                return data;
            })
            .catch(error => {
                console.log(error);
            });
    }

    public getUpdatePatientObject(control: AbstractControl) : FormGroup {


        return this.fb.group({
          patientId: control.get('PatientId')?.value,
          treatmentPriority: control.get('Treatment priority')?.value || null,
          temperament: control.get('Temperament')?.value || null,
          age: control.get('Age')?.value || null,
          releaseStatus: control.get('Release status')?.value || null,
          abcStatus: control.get('ABC status')?.value || null,
          knownAsName: control.get('Known as name')?.value,
          sex: control.get('Sex')?.value,
          description: control.get('Description')?.value || null,
          mainProblems: control.get('Main Problems')?.value || null,
          animalTypeId: control.get('animalTypeId')?.value
        });
      }



}


