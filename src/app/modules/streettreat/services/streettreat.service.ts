import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StreetTreatForm } from 'src/app/core/models/release';
import { SearchStreetTreatResponse } from 'src/app/core/models/responses';
import { ActiveCasesForTeamByDateResponse, ChartResponse, StreetTreatCase, StreetTreatCaseByVisitDateResponse, StreetTreatSearchVisitsResponse} from 'src/app/core/models/streettreet';
import { APIService } from 'src/app/core/services/http/api.service';
import { StorageService } from 'src/app/core/services/storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class StreetTreatService extends APIService {
  constructor(
    http: HttpClient,
    protected storage: StorageService) {
    super(http);
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
    const request = '/SearchStreetTreatCases/?' + searchString;
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

  public async saveStreetTreatForm(streetTreatCaseForm: StreetTreatForm) {
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
    return await this.put(teamVisitData);
  }

  public getChartData(){
    const request = '';
    return this.getObservable(request).pipe(
      map((response:ChartResponse)=>{
        return response;
      })
    );
  }


  public getActiveStreetTreatCasesWithNoVisits(){
    const request = '/novisits';

    return this.getObservable(request).pipe(
      map((response:any)=>{
        return response;
      })
    );
  }
  public getStreetTreatWithVisitDetailsByPatientId(patientId:number):Observable<StreetTreatForm>{
    const request = `?patientId=${patientId}`;
    return this.getObservable(request).pipe(
      map((response)=>{
        return response?.streetTreatForm;
      })
    );
  }

  getScoreCards(){
    const request = '/scorecards';
    return this.getObservable(request).pipe(
      map((scoreCards)=>{
        return scoreCards;
      })
    );
  }




}
