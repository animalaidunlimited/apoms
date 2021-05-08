import { Injectable } from '@angular/core';
import { APIService } from 'src/app/core/services/http/api.service';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Patient, PatientCalls, PatientCallModifyResponse, PatientCallResult, Patients,
    CrueltyReport, CrueltyReportResult, PatientOutcome, PatientOutcomeResponse } from 'src/app/core/models/patients';
import { MediaItem, MediaResponse } from 'src/app/core/models/media';
import { PrintPatient } from 'src/app/core/models/print-templates';
import {MediaItemsDataObject, Comment} from 'src/app/core/models/media';
import { ConstantPool } from '@angular/compiler';

interface SuccessResult{
    success: number;
}

@Injectable({
    providedIn: 'root',
})
export class PatientService extends APIService {

    mediaItemData : MediaItemsDataObject[] = [];

    mediaItemObject! : MediaItem;

    returnMediaItem : BehaviorSubject<MediaItem[]> = new BehaviorSubject<MediaItem[]>([]);

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

    public async updatePatientDetails(patientDetails: any) {

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
        const response:PatientCallModifyResponse[] = [];

        for (const call of patientCalls.calls) {
            if (call.patientCallId && call.updated) {
                call.patientId = patientCalls.patientId;

                await this.put(call)
                    .then((data: PatientCallResult) => {
                        if(data.success === -1) {
                            response.push(
                                {position: 0,
                                results: {
                                    patientCallId: 0,
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
            } else if (!call.patientCallId && call.updated) {
                call.patientId = patientCalls.patientId;

                await this.post(call)
                    .then((data: PatientCallResult) => {
                        if(data.success === -1) {
                            response.push(
                                {position: 0,
                                results: {
                                    patientCallId: 0,
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

    public async savePatientMedia(mediaItem: MediaItem){

        return await this.put(mediaItem)
            .then((data:SuccessResult) => {

                if(data.success === 1){

                    let patientMediaItem = this.mediaItemData.find(patientMediaItemVal =>
                        patientMediaItemVal.patientId === mediaItem.patientId
                    );

                    if(!patientMediaItem){
                        // We're loading the service for the first time and the first patient has no photos

                        patientMediaItem = {
                            patientId: mediaItem.patientId,
                            mediaItem : new BehaviorSubject<MediaItem[]>([mediaItem])
                        };

                        this.mediaItemData.push(patientMediaItem);


                    }

                    let dataItem = patientMediaItem.mediaItem.getValue();

                    if(mediaItem.deleted){
                        dataItem = dataItem.filter(e => e.patientMediaItemId !== mediaItem.patientMediaItemId);
                    }

                    const existingItem = dataItem.findIndex(item => item.patientMediaItemId = mediaItem.patientMediaItemId);

                    if(existingItem === -1 ){
                        dataItem.push(mediaItem);
                    }
                    else {
                        dataItem[existingItem] = mediaItem;
                    }

                    patientMediaItem.mediaItem.next(dataItem);

                }

                return data;
            })
            .catch(error => {
                console.log(error);
            });

    }

    public getPatientMediaItemsByPatientId(patientId: number): BehaviorSubject<MediaItem[]> {

        const request = '/PatientMediaItems?patientId=' + patientId;

        let patientMediaItem = this.mediaItemData.find(patientMediaItemVal =>
            patientMediaItemVal.patientId === patientId
        );


        const returnBehaviorSubject: BehaviorSubject<MediaItem[]> =
        patientMediaItem ? patientMediaItem.mediaItem : new BehaviorSubject<MediaItem[]>([]);

        if(!patientMediaItem){
            patientMediaItem = this.addEmptyPatientMediaBehaviorSubject(returnBehaviorSubject, patientId);
        }

        // tslint:disable-next-line: deprecation
        this.getObservable(request).pipe(
            map(mediaItems => mediaItems.sort((a:any, b:any) => new Date(b?.datetime).getTime() - new Date(a?.datetime).getTime()))
        ).subscribe((media : MediaResponse[])=>{

            if(!media){
                return;
            }

            const savedMediaItems: MediaItem[] = media.map(item=>{

                return {
                    mediaItemId : of(item.mediaItemId),
                    patientMediaItemId: item.mediaItemId,
                    mediaType: item.mediaType,
                    localURL: item.localURL,
                    remoteURL: item.remoteURL,
                    isPrimary :item.isPrimary ? true : false,
                    datetime: item.datetime,
                    patientId: item.patientId,
                    heightPX: item.heightPX,
                    widthPX: item.widthPX,
                    tags: item.tags,
                    uploadProgress$: of(100),
                    updated: false,
                    deleted: false
                };

            });

            if(patientMediaItem){
                patientMediaItem.mediaItem.next(savedMediaItems);
            }

        });

        return returnBehaviorSubject;
    }

    addEmptyPatientMediaBehaviorSubject(returnBehaviorSubject:BehaviorSubject<MediaItem[]>, patientId:number) : MediaItemsDataObject {

        const newItemData : MediaItemsDataObject = {
            patientId,
            mediaItem : returnBehaviorSubject
        };
        returnBehaviorSubject.next([]);
        this.mediaItemData.push(newItemData);

        return newItemData;

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
    public async savePatientMediaComment(comment: any) : Promise<PatientOutcomeResponse> {
        return await this.post(comment)
        .then(data => {
            if(data?.success === 1){
                return data;
            }
        })
        .catch(error => {
            console.log(error);
        });

    }

    public getPatientMediaComments(patientMediaItemId: number): Observable<Comment[]> {

        const request = '/PatientMediaComments?patientMediaItemId=' + patientMediaItemId;

        return this.getObservable(request).pipe(
            map(response => {
                return  response?.sort((comment1: Comment,comment2:Comment)=> {
                    return new Date(comment2.timestamp).valueOf() - new Date(comment1.timestamp).valueOf();
                });

            })
        );
    }



}


