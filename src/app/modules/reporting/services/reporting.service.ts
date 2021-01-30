import { Injectable } from '@angular/core';
import { APIService } from 'src/app/core/services/http/api.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EmergencyRecordTable } from 'src/app/core/models/emergency-record';

@Injectable({
  providedIn: 'root'
})
export class ReportingService extends APIService{
  
  endpoint = 'Reporting';

  constructor(public http: HttpClient) {
    super(http);
  }

  public getEmergencyCaseByDateAndOutcomeOrST(dateValue: Date | string, streetTreat:boolean, admission: boolean) : Observable<EmergencyRecordTable[]> {

    let outcomeId: number;
      outcomeId = streetTreat ? 
      18 :
      admission ? 
      1 :
      0;

      const request = '?searchDate=' + dateValue + '&outcome=' + outcomeId ;

      return this.getObservable(request).pipe(
        map((response:EmergencyRecordTable[]) => {
          return response;
        }),
      );
  }
}
