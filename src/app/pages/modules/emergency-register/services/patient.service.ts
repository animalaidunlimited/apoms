import { Injectable } from '@angular/core';
import { CrudService } from 'src/app/core/services/http/crud.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PatientService extends CrudService  {

  constructor(http: HttpClient) {
    super(http)
   }

   endpoint = 'Patient';

   public checkTagNumberExists(tagNumber:string):Observable<any>
   {
    let tagNumberQuery = "TagNumber=" + tagNumber;

     return this.getByField("CheckTagNumberExists", tagNumberQuery)
               .pipe(
                 map(value => {
                   return value;
                 })
               );
   }
}
