import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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


getTreatmentsByPatientId(patientId: number){

  return {success : 1};

}

getLastTreatmentByDate(treatmentDate: string | Date){

  return {success : 1};

}

getTreatmentByTreatmentId(treatmentId: number){

  return {success : 1};

}

saveTreatment(saveData:TreatmentRecord){

  if(saveData.treatmentId){

    this.put(saveData);

  }
  else{

    this.post(saveData);

  }

}

deleteTreatmentsByDate(treatmentDate: string | Date){

  return {success : 1};

}

}
