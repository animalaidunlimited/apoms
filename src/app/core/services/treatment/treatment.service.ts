import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AcceptTreatmentListMoveIn, ReportPatientRecord, TreatmentAreaChange } from '../../models/census-details';
import { TreatmentRecord } from '../../models/treatment';
import { APIService } from '../http/api.service';
import { ABCStatus, Age, ReleaseStatus, Temperament } from 'src/app/core/enums/patient-details';


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

public async getTreatmentList(treatmentAreaId:number) : Promise<ReportPatientRecord[]> {

  const request = '?treatmentAreaId=' + treatmentAreaId;

  // Let's get the treatment list and sort it before we send it to the component
  return this.get(request).then(unknownResponse => {

    let response = unknownResponse as ReportPatientRecord[];

    response ?
    response = response.map((patient:ReportPatientRecord) => {

      const patientObject = JSON.parse(JSON.stringify(patient));

      patient['ABC status'] = ABCStatus[patientObject['ABC status']];
      patient['Release status'] = ReleaseStatus[patientObject['Release status']];
      // tslint:disable-next-line: no-string-literal
      patient['Temperament'] = Temperament[patientObject['Temperament']];
      // tslint:disable-next-line: no-string-literal
      patient['Age'] = Age[patientObject['Age']];

      return patient;

    })
    :
    response = [];

  return response.sort((a, b) => {

    let sortResult = 0;

    if ((a['Treatment priority'] || 999) === (b['Treatment priority'] || 999)) {

      sortResult = a['Tag number'] < b['Tag number'] ? -1 : 1;
    }
    else {

      sortResult = (a['Treatment priority'] || 999) > (b['Treatment priority'] || 999) ? 1 : -1;
    }

    return sortResult;
  });

  });

}

public async movePatientOutOfArea(updatedPatient:TreatmentAreaChange){

  return await this.putSubEndpoint('MoveOut', updatedPatient);

}

public async acceptMoveIn(acceptedMovePatient:AcceptTreatmentListMoveIn){

  return await this.putSubEndpoint('AcceptMoveIn', acceptedMovePatient);

}

deleteTreatmentsByDate(treatmentDate: string | Date){

  return {success : 1};

}

}
