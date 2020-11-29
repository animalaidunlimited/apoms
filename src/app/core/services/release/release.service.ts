import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from '../http/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
	const request = `?PatientId=${patientId}`;
	return await this.get(request);
  }
  public getReleaseDetails(patientId:number) : Observable<any> {
    const request:string = '?PatientId=' + patientId;
    return this.getObservable(request).pipe(
      map((res: any)=> {
        return res;
      })
    );
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
