import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from '../http/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReleaseDetails, ReleaseResponse } from '../../models/release';

@Injectable({
  providedIn: 'root'
})
export class ReleaseService extends APIService {

  endpoint = 'ReleaseDetails';

  constructor(public http: HttpClient) {
    super(http);
  }

  public async saveRelease(releaseDetails: ReleaseDetails) : Promise<any> {
    if(releaseDetails.releaseId) {
      return this.put(releaseDetails);
    }
    else {
      return this.post(releaseDetails);
    }
  }

  public getReleaseDetails(patientId: number) : Observable<any> {

    const request = '?PatientId=' + patientId;
    return this.getObservable(request).pipe(
      map((res: ReleaseResponse)=> {
        return res;
      })
    );
  }

}
