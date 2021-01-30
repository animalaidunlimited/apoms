import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { StreetTreatForm } from 'src/app/core/models/release';
import { SearchStreetTreatResponse } from 'src/app/core/models/responses';
import { ActiveCasesForTeamByDateResponse, ChartResponse, StreetTreatCase, StreetTreatCaseByVisitDateResponse, StreetTreatSearchVisitsResponse} from 'src/app/core/models/streettreet';
import { APIService } from 'src/app/core/services/http/api.service';
import { OnlineStatusService } from 'src/app/core/services/online-status/online-status.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { StorageService } from 'src/app/core/services/storage/storage.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';

@Injectable({
  providedIn: 'root'
})
export class StreetTreatService extends APIService {
  online: boolean;
  constructor(
    http: HttpClient,
    private onlineStatus: OnlineStatusService,
    protected storage: StorageService,
    private userOptions: UserOptionsService,
    private showSnackBar: SnackbarService) {
    super(http);
    this.online = this.onlineStatus.isOnline;
    this.checkStatus(onlineStatus);
  }
  endpoint = 'StreetTreat';
  response: SearchStreetTreatResponse = {} as SearchStreetTreatResponse;
  redirectUrl = '';
  saveCaseFail = false;

  
  
  /**
   * 
   * @param searchString | string Query for 
   * @return streettreat case which are released 
   */
  public searchCases(searchString: string) {
    const request = '/SearchStreetTreatCases/?' + searchString
    return this.getObservable(request).pipe(
     map((response: SearchStreetTreatResponse[]) => {
          return response;
      }),
    ); 
  }
  public async baseInsertCase(streetTreatCase: StreetTreatCase): Promise<any> {
    // Insert the new emergency record
    return await this.post(streetTreatCase);
  }

  public async baseUpdateCase(streetTreatCase: StreetTreatCase): Promise<any> {
    return await this.put(streetTreatCase);
  }

  private async postFromLocalStorage(postsToSync: any) {
    const promiseArray = postsToSync.map(
      async (elem: any) =>

        await this.baseInsertCase(JSON.parse(elem.value)).then(
          (result: SearchStreetTreatResponse) => {

            if (
              result.streetTreatCaseSuccess === 1 ||
              result.streetTreatCaseSuccess === 3 ||
              result.streetTreatCaseSuccess === 2
            ) {
              this.storage.remove(elem.key);
            }
          }
        )
    );
    return await Promise.all(promiseArray).then(result => {
      return result;
    });
  } 
  private async putFromLocalStorage(putsToSync: any) {
    const promiseArray = putsToSync.map(
      async (elem: any) =>
        await this.baseUpdateCase(JSON.parse(elem.value)).then(
          (result: SearchStreetTreatResponse) => {

            if (
              result.streetTreatCaseSuccess === 1 ||
              result.streetTreatCaseSuccess === 3 ||
              result.streetTreatCaseSuccess === 2
            ) {
              this.storage.remove(elem.key);
            }
          })
    );
    return await Promise.all(promiseArray).then(result => {
      return result;
    });
  } 

  private async checkStatus(onlineStatus: OnlineStatusService) {
    onlineStatus.connectionChanged.subscribe(async online => {
      if (online) {
        this.online = true;

        this.showSnackBar.successSnackBar('Connection restored', 'OK');

        await this.postFromLocalStorage(
          this.storage.getItemArray('POST'),
        ).then(result => {

          // Only alert if we've inserted new cases
        if (result.length > 0) {
            const insertWaitToShowMessage = (this.userOptions.getNotifactionDuration() * 20) + 1000;
            setTimeout(() => {
              this.showSnackBar.successSnackBar('Synced updated cases with server', 'OK');
            }, insertWaitToShowMessage);
          } 
        }).catch(error => {
          console.log(error);
        });
        await this.putFromLocalStorage(this.storage.getItemArray('PUT'))
          .then(result => {
            if (result.length > 0) {
              const insertWaitToShowMessage = (this.userOptions.getNotifactionDuration() * 30) + 1000;
              setTimeout(() => {
                this.showSnackBar.successSnackBar('Synced updated cases with server', 'OK');
              }, insertWaitToShowMessage);
            }
          })
          .catch(error => {
            console.log(error);
          });
      }
    });
  } 
  public getStreetTreatCaseById(streetTreatCaseId: number) {
    return this.getById(streetTreatCaseId).pipe(
      map(value => {
          return value;
      }),
    );
  }
  
  public getVisitDatesByStreetTreatCaseId(streetTreatCaseId: number) {
    const request = '/SearchVisits/?streetTreatCaseId=' + streetTreatCaseId;
    return this.getObservable(request).pipe(
     map((response: StreetTreatSearchVisitsResponse[]) => {
          return response;
      }),
    ); 
  }

  public getActiveStreetTreatCasesWithVisitByDate(date: Date){
    const request = '?date='+ date;  
    return this.getObservable(request).pipe(
      map((response: StreetTreatCaseByVisitDateResponse) => {
           return response;
       }),
     ); 
  }

  public async saveStreetTreatForm(streetTreatCaseForm: StreetTreatForm) : Promise<any> {
    return await this.post(streetTreatCaseForm)
    .then(data => {
        return data;
    })
    .catch(error => {
        console.log(error);
    });
  }
  public getActiveCasesForTeamByDate(teamId: number,date: Date){
    const request = `?date=${date}&teamid=${teamId}`;
    return this.getObservable(request).pipe(
      map((response:ActiveCasesForTeamByDateResponse)=>{
        return response;
      })
    );
  }
  
  public async updateVisitTeamByTeamId(teamVisitData:any){
    return await this.put(teamVisitData)
  }
  public getChartData(){
    const request = "";
    return this.getObservable(request).pipe(
      map((response:ChartResponse)=>{
        return response
      })
    );
  }
  public getActiveStreetTreatCasesWithNoVisits(date:Date){
    const request = `/novisits?date=${date}`;
    return this.getObservable(request).pipe(
      map((response:any)=>{
        return response;
      })
    );
  }
  public getStreetTreatWithVisitDetailsByPatientId(patientId:number){
    const request = `?patientId=${patientId}`;
    return this.getObservable(request).pipe(
      map((response:any)=>{
        return response.streetTreatForm;
      })
    );
  }
  
}
