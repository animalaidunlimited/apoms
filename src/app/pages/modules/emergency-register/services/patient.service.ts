import { Injectable } from '@angular/core';
import { CrudService } from 'src/app/core/services/http/crud.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Patient } from 'src/app/core/models/patients';

@Injectable({
  providedIn: 'root'
})
export class PatientService extends CrudService  {

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
}
