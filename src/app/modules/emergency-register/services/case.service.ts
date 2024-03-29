import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from 'src/app/core/services/http/api.service';
import { EmergencyCase, CaseToOpen } from 'src/app/core/models/emergency-record';
import { EmergencyResponse, SearchResponse } from 'src/app/core/models/responses';
import { StorageService } from 'src/app/core/services/storage/storage.service';
import { debounceTime, map, mergeMap, share, skip, takeUntil, withLatestFrom } from 'rxjs/operators';
import { Observable, BehaviorSubject, Subject, combineLatest, merge, of } from 'rxjs';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { OnlineStatusService } from 'src/app/core/services/online-status/online-status.service';



@Injectable({
    providedIn: 'root',
})
export class CaseService extends APIService {

    caseToOpen$ : BehaviorSubject<CaseToOpen | undefined> = new BehaviorSubject<CaseToOpen | undefined>(undefined);

    clearResultsOnTabSwitch$: Observable<boolean | undefined>;
    clearResults$: BehaviorSubject<SearchResponse[]> = new BehaviorSubject<SearchResponse[]>([] as SearchResponse[]);

    emergencyResponse: BehaviorSubject<EmergencyResponse> = new BehaviorSubject<EmergencyResponse>({} as EmergencyResponse);

    offlineEmergencyResponse!: EmergencyResponse;
    private ngUnsubscribe = new Subject();

    constructor(
        http: HttpClient,
        private onlineStatus: OnlineStatusService,
        protected storage: StorageService,
        private userOptions: UserOptionsService,
        private toaster: SnackbarService
    ) {
        super(http);

        //Depending on the user's preference, clear the results when they switch tabs
        this.clearResultsOnTabSwitch$ = this.userOptions.getUserPreferences().pipe(map(prefs => prefs.clearSearchOnTabReturn));

        this.caseToOpen$.pipe(
                            skip(1),
                            withLatestFrom(this.clearResultsOnTabSwitch$))
                        .subscribe(clearResults => {

            if(clearResults[1]){
                this.clearResults$.next([] as SearchResponse[]);
            }

        });
    }

    endpoint = 'EmergencyRegister';
    response: EmergencyResponse = {} as EmergencyResponse;
    redirectUrl = '';

    saveCaseFail = false;

    private async postFromLocalStorage(postsToSync:any) {
        let promiseArray;
            promiseArray = postsToSync.map(
                (elem:any) =>
             this.baseInsertCase(JSON.parse(elem.value)).then(
                (result: any) => {

                    if (
                        result.emergencyCaseSuccess === 1
                    ) {
                        this.emergencyResponse.next(result);
                        this.storage.remove(elem.key);
                    }

                    if(result.emergencyCaseSuccess === 3 ||
                            result.emergencyCaseSuccess === 2) {
                                this.storage.remove(elem.key);
                    }
                    return result;
                }
            )

            );

        return await Promise.all(promiseArray).then(result => {
            return result;
        });
    }

    private async putFromLocalStorage(putsToSync:any) {
        let promiseArray;

        promiseArray = putsToSync.map(
            (elem:any) =>

                this.baseUpdateCase(JSON.parse(elem.value)).then(
                                (result: any) => {


                                    if (
                                        result.emergencyCaseSuccess === 1 ||
                                        result.emergencyCaseSuccess === 3 ||
                                        result.emergencyCaseSuccess === 2
                                    ) {
                                        this.emergencyResponse.next(result);
                                        this.storage.remove(elem.key);
                                    }
                                    return result;
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
            this.getConnection();

            return result;
        }).catch(async error => {

            if (error.status === 504 || !this.onlineStatus.connectionChanged.value) {

                this.saveCaseFail = true;
                if(this.saveCaseFail) {
                    this.toaster.errorSnackBar('hello', 'OK');
                    this.onlineStatus.updateOnlineStatusAfterUnsuccessfulHTTPRequest();

                }
                // The server is offline, so let's save this to the database
                return await this.saveToLocalDatabase('PUT'+ emergencyCase.emergencyForm.emergencyDetails.guId, emergencyCase);
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
            .then(async result => {

                if(result.callerSuccess === 0){
                    return await this.saveAndRejectCase(emergencyCase);
                }

                    this.onlineStatus.updateOnlineStatusAfterSuccessfulHTTPRequest();
                    this.getConnection();

                return result;
            })
            .catch(async error => {

                console.log(error);

                if (error.status === 504 || !this.onlineStatus.connectionChanged.value) {
                    return await this.saveAndRejectCase(emergencyCase);
                }
                else{
                    return '';
                }
            });
    }

    private async saveAndRejectCase(emergencyCase: EmergencyCase) {
        this.toaster.errorSnackBar('Case saved to local storage', 'OK');

        this.saveCaseFail = true;

        this.onlineStatus.updateOnlineStatusAfterUnsuccessfulHTTPRequest();
        // The server is offline, so let's save this to the database
        return await this.saveToLocalDatabase(
            'POST' + emergencyCase.emergencyForm.emergencyDetails.guId,
            emergencyCase
        );
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

        let searchResult = of([] as SearchResponse[]);

        if(!searchString){
            this.clearResults$.next([]);
        }
        else{
            searchResult = this.getObservable(request)
            .pipe(
                debounceTime(1500),    
                map((response: SearchResponse[]) => response),
                share()
            );
        }
        
        return merge(this.clearResults$, searchResult);

    }

    //public clearSearchCases()

    private async saveToLocalDatabase(key:any, body:any) {
        // Make a unique identified so we don't overwrite anything in local storage.

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

    public afterSaveEmergencyResponse() {
        return this.emergencyResponse.asObservable();
    }


    public async insertOrUpdatePatientFromRescueDetailsDialog(patientDetails: any) {

        return await this.put(patientDetails)
            .then(data => {
                return data;
            })
            .catch(error => {
                console.log(error);
            });
    }

    public openCase(caseToOpen: CaseToOpen) {
        this.caseToOpen$.next(caseToOpen);
    }


    public getConnection() {

        this.onlineStatus.connectionChanged.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async online=>{

            if(online) {
                // Insert case from local storage to database.
                await this.postFromLocalStorage(this.storage.getItemArray('POST'))
                .then(result => {

                    // Only alert if we've inserted new cases.

                    if(result.length > 0){

                        const insertWaitToShowMessage = (this.userOptions.getNotificationDuration() * 20) + 1000;

                        setTimeout(() => {
                            this.toaster.successSnackBar('Synced updated cases with server', 'OK');
                        }, insertWaitToShowMessage);

                    }

                })
                .catch(error => {
                    console.log(error);
                });

                // Update case from local storage to database.
                await this.putFromLocalStorage(this.storage.getItemArray('PUT'))
                .then(result => {


                    if(result.length > 0){

                        const insertWaitToShowMessage = (this.userOptions.getNotificationDuration() * 30) + 1000;


                    setTimeout(() => {
                        this.toaster.successSnackBar('Synced updated cases with server', 'OK');
                    }, insertWaitToShowMessage);

                    }


                })
                .catch(error => {
                    console.log(error);
                });

            }

        }).unsubscribe();
    }
}
