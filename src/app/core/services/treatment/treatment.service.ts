import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TreatmentAreaChange } from '../../models/census-details';
import { TreatmentRecord } from '../../models/treatment';
import { APIService } from '../http/api.service';


@Injectable({
  providedIn: 'root'
})
export class TreatmentService extends APIService {

  endpoint = 'Treatment';

  constructor(public http: HttpClient) {
    super(http);
}


public async getTreatmentsByPatientId(patientId: number): Promise<any>{

  const request:string = '?patientId=' + patientId;

  return await this.get(request);

}

public async getLastTreatmentByDate(patientId: number, treatmentDate: string | Date): Promise<any>{

  const request:string = '?patientId=' + patientId + '&treatmentDate=' + treatmentDate;

  return await this.get(request);

}

public async getTreatmentByTreatmentId(treatmentId: number): Promise<any>{

  const request:string = '?treatmentId=' + treatmentId;

  return await this.get(request);

}

public async saveTreatment(saveData:TreatmentRecord): Promise<any>{

  if(saveData.treatmentId){

    return await this.put(saveData);

  }
  else{

    return await this.post(saveData);

  }

}

public async getTreatmentList(treatmentAreaId:number) : Promise<any> {

  const request = '?treatmentAreaId=' + treatmentAreaId;
  return this.get(request);

}

public async movePatientOutOfArea(updatedPatient:TreatmentAreaChange){

  return await this.postSubEndpoint('MoveOut', updatedPatient);

}

deleteTreatmentsByDate(treatmentDate: string | Date){

  return {success : 1};

}

}
