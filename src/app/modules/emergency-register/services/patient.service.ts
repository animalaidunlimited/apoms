import { Injectable } from '@angular/core';
import { APIService } from 'src/app/core/services/http/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Patient, PatientCall } from 'src/app/core/models/patients';

@Injectable({
  providedIn: 'root'
})
export class PatientService extends APIService  {

  constructor(http: HttpClient) {
    super(http)
   }

   endpoint = 'Patient';

   public checkTagNumberExists(tagNumber:string, emergencyCaseId:number, patientId:number):Observable<any>
   {

    let tagNumberQuery =  "TagNumber=" + tagNumber +
                          "&EmergencyCaseId=" + emergencyCaseId +
                          "&PatientId=" + patientId;

     return this.getByField("CheckTagNumberExists", tagNumberQuery)
               .pipe(
                 map(value => {
                   return value;
                 })
               );
   }

   public getPatientsByEmergencyCaseId(number: number):Observable<any>{

    let request = "?emergencyCaseId=" + number;

   return this.getObservable(request)
   .pipe(
     map((response:Patient[]) => {
       return response;
     })
   );

  }

  public getPatientByPatientId(patientId: number):Observable<any>{

    let request = "?patientId=" + patientId;

   return this.getObservable(request)
   .pipe(
     map((response:Patient[]) => {
       return response;
     })
   );

  }

  public async updatePatientStatus(patient:any){

          return await this.put(patient).then((data) => {
            return data;
          })
          .catch((error) => {
            console.log(error);
          });;

  }

  public getPatientCallCallsByPatientId(patientId: number):Observable<any>{

    let request = "PatientCall?patientId=" + patientId;

   return this.getObservable(request)
   .pipe(
     map((response:Patient[]) => {
       return response;
     })
   );

  }

  public async savePatientCalls(patientCalls:PatientCall[]){

    patientCalls.forEach(async (patientCall:PatientCall) => {

      if(patientCall.updated && patientCall.patientId) {

        return await this.put(patientCall).then((data) => {
          return data;
        })
        .catch((error) => {
          console.log(error);
        });

      }
      else if(patientCall.updated && !patientCall.patientId){

        return await this.post(patientCall).then((data) => {
          return data;
        })
        .catch((error) => {
          console.log(error);
        });

      }

    } )



}

}
