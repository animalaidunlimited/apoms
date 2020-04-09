import { Injectable } from '@angular/core';
import { APIService } from '../../services/http/api.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocationDetailsService extends APIService {

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
