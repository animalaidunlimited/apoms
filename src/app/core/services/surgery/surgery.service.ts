import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { APIService } from '../http/api.service';
// import { promise } from "protractor";
@Injectable({
  providedIn: 'root'
})
export class SurgeryService extends APIService {

  endpoint:string = "SurgeryRegister";

  constructor(public http : HttpClient) { 
    super(http)
  }

  public async insertSurgery(surgerydata) : Promise<any>
  {
    let request = "surgery";
    console.log(surgerydata);

    if (surgerydata.SurgeryId){ 
      return this.put(surgerydata);
    }
    else{
      return this.post(surgerydata);
    
    }
  }
  
  public async getSurgeryBySurgeryId(surgeryId) : Promise<any>
  {
    let request = "?SurgeryId=" + surgeryId;

    return this.get(request);
  }

  public getSurgeryByPatientId(patientId:number) : Promise<any>
  {
    let request = "?PatientId=" + patientId;

    console.log("hi");

    return this.get(request);
  }


  
}
