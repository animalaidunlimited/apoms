import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from '../http/api.service';

@Injectable({
  providedIn: 'root'
})
export class ReleaseService extends APIService {

  endpoint = 'ReleaseDetails';

  constructor(public http: HttpClient) {
    super(http);
  }

  public async saveRelease(releaseDetails: any) : Promise<any> {
    if(releaseDetails.releaseId) {
      return await this.put(releaseDetails);
    }
    else {
      return await this.post(releaseDetails);
    }
  }

  public async saveStreatTreatCase(streatDetails: any): Promise<any>{
	  return await this.post(streatDetails);
  }

}
