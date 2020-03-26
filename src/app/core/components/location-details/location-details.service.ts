import { Injectable } from '@angular/core';
import { CrudService } from '../../services/http/crud.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocationDetailsService extends CrudService {

  constructor(http: HttpClient) {
    super(http)
   }

   endpoint = 'Location';

  public getLocationByEmergencyCaseId(number: string):Observable<any>{

    let request = "?emergencyCaseId=" + number;

   return this.getObservable(request)
   .pipe(
     map((response:Location) => {
       return response;
     })
   );

  }
}
