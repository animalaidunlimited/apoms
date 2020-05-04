import { Injectable } from '@angular/core';
import { APIService } from 'src/app/core/services/http/api.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RescueDetails } from 'src/app/core/models/emergency-record';
import { RescueDetailsParent } from 'src/app/core/models/responses';

@Injectable({
  providedIn: 'root'
})
export class RescueDetailsService extends APIService {

  constructor(
    http: HttpClient,
    ) {
      super(http);
    }

    endpoint = 'RescueDetails';
    redirectUrl: string;


  public getRescueDetailsByEmergencyCaseId(emergencyCaseId: number):Observable<RescueDetailsParent>{

    let request = "?emergencyCaseId=" + emergencyCaseId;

    return this.getObservable(request)
    .pipe(
      map((response:RescueDetailsParent) => {
        return response;
      })
    );

  }

  //TODO change this to by properly typed
  public async updateRescueDetails(rescueDetails:any): Promise<any> {

    return await this.put(rescueDetails);

  }
}
