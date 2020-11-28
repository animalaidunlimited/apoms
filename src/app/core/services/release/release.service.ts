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

  public async saveStreetTreatCase(streetDetails: any): Promise<any>{
    if(streetDetails.streetTreatCaseId)
    {
	  this.endpoint = `ReleaseDetails/streettreat`;
      return await this.put(streetDetails);
    }
    else{
      return await this.post(streetDetails);
    }
  }
	public getStreetTreatCasesByPatientId(patientId:any): Promise<any>{
		const request = `?GetStreetTreatCasesByPatientId=${patientId}`;
		return this.get(request);
	}
	/* public getVisitsByStreetTreatCaseId(streetTreatCaseId:any): Promise<any>{
    	const request = `?GetVisitsByStreetTreatCaseId=${streetTreatCaseId}`;
    	return this.get(request);
	} */
}
