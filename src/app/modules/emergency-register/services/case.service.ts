import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from 'src/app/core/services/http/api.service';
import { EmergencyCase } from 'src/app/core/models/emergency-record';
import { EmergencyResponse, SearchResponse, SuccessOnlyResponse } from 'src/app/core/models/responses';
import { StorageService } from 'src/app/core/services/storage/storage.service';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { UUID } from 'angular2-uuid';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { OnlineStatusService } from 'src/app/core/services/online-status/online-status.service';
import { async } from '@angular/core/testing';
import { ConnectionService } from 'ng-connection-service';
import { getCurrentTimeString } from 'src/app/core/helpers/utils';
@Injectable({
    providedIn: 'root',
}) 
export class CaseService extends APIService {

    emergencyResponse: BehaviorSubject<EmergencyResponse> = new BehaviorSubject<EmergencyResponse>({} as EmergencyResponse);

    offlineEmergencyResponse!: EmergencyResponse;

    constructor(
        http: HttpClient,
        private onlineStatus: OnlineStatusService,
        private connectionService: ConnectionService,
        protected storage: StorageService,
        private userOptions: UserOptionsService,
        private toaster: SnackbarService
    ) {
        super(http);
        this.online = this.onlineStatus.isOnline;
        this.checkStatus(onlineStatus);
    }

    endpoint = 'EmergencyRegister';
    response: EmergencyResponse = {} as EmergencyResponse;
    redirectUrl = '';

    online: boolean;

    saveCaseFail = false;

    private async checkStatus(onlineStatus: OnlineStatusService) {

        console.log(getCurrentTimeString());

        onlineStatus.connectionChanged.subscribe(async online => {

            if (online) {
                this.online = true;
                // this.toaster.successSnackBar('Connection restored', 'OK');

                    await this.postFromLocalStorage(this.storage.getItemArray('POST'))
                    .then(result => {

                        // Only alert if we've inserted new cases.

                        if(result.length > 0){

                            const insertWaitToShowMessage = (this.userOptions.getNotifactionDuration() * 20) + 1000;

                            setTimeout(() => {
                                this.toaster.successSnackBar('Synced updated cases with server', 'OK');
                            }, insertWaitToShowMessage);

                        }

                    })
                    .catch(error => {
                        console.log(error);
                    });

                    await this.putFromLocalStorage(this.storage.getItemArray('PUT'))
                        .then(result => {


                            if(result.length > 0){

                                const insertWaitToShowMessage = (this.userOptions.getNotifactionDuration() * 30) + 1000;


                            setTimeout(() => {
                                this.toaster.successSnackBar('Synced updated cases with server', 'OK');
                            }, insertWaitToShowMessage);

                            }


                        })
                        .catch(error => {
                            console.log(error);
                        });

                
            } else {
                this.online = false;

                // If the failure was found by a failed save case then don't alert the user, as we'll have aleady told the user the
                // save failed
                this.saveCaseFail ?
                    this.saveCaseFail = !this.saveCaseFail
                :
                    this.toaster.errorSnackBar('Connection lost', 'OK');


            }
        });
        

    }

    private async postFromLocalStorage(postsToSync:any) {
        let promiseArray;
            promiseArray = postsToSync.map(
                async (elem:any) =>
            await this.baseInsertCase(JSON.parse(elem.value)).then(
                (result: any) => {
                    if(result.success === -1) {
                        console.log('hello');
                    }
                    else {
                        if (
                            result.emergencyCaseSuccess === 1 ||
                            result.emergencyCaseSuccess === 3 ||
                            result.emergencyCaseSuccess === 2
                        ) {
                            console.log(result);
                            this.emergencyResponse.next(result);
                            this.storage.remove(elem.key);                  
                        }
                    }
                }
            )
                    
            );
            // promiseArray = postsToSync.forEach(async (elem: any)=> {
            //     await this.baseInsertCase(JSON.parse(elem.value)).then(
            //         (result: any) => {
            //             if(result.success === -1) {
            //                 console.log('hello');
            //             }
            //             else {
            //                 if (
            //                     result.emergencyCaseSuccess === 1 ||
            //                     result.emergencyCaseSuccess === 3 ||
            //                     result.emergencyCaseSuccess === 2
            //                 ) {
    
            //                     console.log(result);
            //                     this.emergencyResponse.next(result);
            //                     this.storage.remove(elem.key);                  
            //                 }
            //             }
                        
            //         }
            //     );
            // });
        return await Promise.all(promiseArray).then(result => {
            return result;
        });
    }

    private async putFromLocalStorage(putsToSync:any) {

        const promiseArray = putsToSync.map(
            async (elem:any) =>

                await this.baseUpdateCase(JSON.parse(elem.value)).then(
                                (result: any) => {

                                    console.log(result); 

                                    if (
                                        result.emergencyCaseSuccess === 1 ||
                                        result.emergencyCaseSuccess === 3 ||
                                        result.emergencyCaseSuccess === 2
                                    ) {
                                        this.storage.remove(elem.key);
                                    }
                                })


        );

        return await Promise.all(promiseArray).then(result => {
            return result;
        });
    }

    public async baseInsertCase(emergencyCase: EmergencyCase): Promise<any> {
        // Insert the new emergency record
        return await this.post(emergencyCase);
    }

    public async updateCase(emergencyCase: EmergencyCase): Promise<any> {

        return await this.baseUpdateCase(emergencyCase)
        .then(result => {

            this.onlineStatus.updateOnlineStatusAfterSuccessfulHTTPRequest();

            return result;
        }).catch(async error => {

            if (error.status === 504 || !this.online) {
                this.toaster.errorSnackBar('Case saved to local storage', 'OK');

                this.saveCaseFail = true;

                this.onlineStatus.updateOnlineStatusAfterUnsuccessfulHTTPRequest();

                // The server is offline, so let's save this to the database
                return await this.saveToLocalDatabase('PUT', emergencyCase);
            }
            else{
                return '';
            }
        });
    }

    public async baseUpdateCase(emergencyCase: EmergencyCase): Promise<any> {

        return await this.put(emergencyCase);
    }

    public async insertCase(emergencyCase: EmergencyCase): Promise<any> {


        return await this.baseInsertCase(emergencyCase)
            .then(result => {

                    this.onlineStatus.updateOnlineStatusAfterSuccessfulHTTPRequest();

                return result;
            })
            .catch(async error => {

                if (error.status === 504 || !this.online) {
                    this.toaster.errorSnackBar('Case saved to local storage', 'OK');

                    this.saveCaseFail = true;

                    this.onlineStatus.updateOnlineStatusAfterUnsuccessfulHTTPRequest();
                    // The server is offline, so let's save this to the database
                    return await this.saveToLocalDatabase(
                        'POST'+ emergencyCase.emergencyForm.emergencyDetails.guId,
                        emergencyCase,
                    );
                }
                else{
                    return '';
                }
            });
    }

    public getEmergencyCaseById(emergencyCaseId: number) {
        return this.getById(emergencyCaseId).pipe(
            map(value => {
                return value;
            }),
        );
    }

    public async deleteById(emergencyNumber: number) {
        try {
            this.response = (await this.deleteById(
                emergencyNumber,
            )) as EmergencyResponse;
            if (!this.response) {
                throw new Error(
                    'Unable to delete Case with ID: emergencyNumber: ' +
                        emergencyNumber,
                );
            }
            return this.response;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public checkEmergencyNumberExists( emergencyNumber: number, emergencyCaseId: number ): Observable<any> {
        const emergencyNumberQuery = 'EmergencyNumber=' + emergencyNumber + '&EmergencyCaseId=' +  emergencyCaseId;

        return this.getByField('CheckEmergencyNumberExists', emergencyNumberQuery
        ).pipe(
            map(value => {
                return value;
            }),
        );
    }

    public searchCases(searchString: string): Observable<SearchResponse[]> {
        const request = '/SearchCases/?' + searchString;

        return this.getObservable(request).pipe(
            map((response: SearchResponse[]) => {
                return response;
            }),
        );
    }

    private async saveToLocalDatabase(key:any, body:any) {
        // Make a unique identified so we don't overwrite anything in local storage.
        // const guid = UUID.UUID();

        try {
            this.storage.save(key , body);
            return Promise.resolve({
                status: 'saved',
                message: 'Record successfully saved to offline storage.',
            });
        } catch (error) {
            return Promise.reject({
                status: 'error',
                message: 'An error occured saving to offline storage: ' + error,
            });
        }
    }

    public getReceived(): Observable<any> {
        const request = '/Received';

        return this.getObservable(request).pipe(
            map(response => {
                return response;
            }),
        );
    }

    public getAssigned(): Observable<any> {
        const request = '/Assigned';

        return this.getObservable(request).pipe(
            map(response => {
                return response;
            }),
        );
    }

    public async updateCaseOutcome(outcomeDetails: EmergencyCase): Promise<EmergencyCase> {

        return await this.put(outcomeDetails);
    }

    public generateUUID() : string{
        return UUID.UUID();
    }

    public afterSaveEmergencyResponse() {
        return this.emergencyResponse.asObservable();
    }
}
