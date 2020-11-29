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
  public async getReleaseDetailsById(patientId:any): Promise<any>{
	this.endpoint = `ReleaseDetails`;
	const request = `?PatientId=${patientId}`;
	return await this.get(request);
  }
  public async getStreetTreatCasesByPatientId(patientId:any): Promise<any>{
	this.endpoint = `ReleaseDetails`;
	const request = `?GetStreetTreatCasesByPatientId=${patientId}`;
	return await this.get(request);
}

  	public async saveStreetTreatCase(streetDetails: any): Promise<any>{
		this.endpoint = `ReleaseDetails/streettreat`;
		if(streetDetails.visitForm.streetTreatCaseId)
		{
		return await this.put(streetDetails);
		}
		else{
		return await this.post(streetDetails);
		}
  	}


}
