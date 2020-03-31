import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Caller, Callers } from '../../models/responses';
import { CrudService } from '../../services/http/crud.service';

@Injectable({
  providedIn: 'root'
})
export class CallerDetailsService extends CrudService {

  constructor(http: HttpClient) {
    super(http)
   }

   endpoint = 'Caller';

   public getCallerByNumber(number: string):Observable<any>{

     let request = "?number=" + number;

    return this.getObservable(request)
    .pipe(
      map((response:Callers) => {
        return response;
      })
    );

   }

   public getCallerByEmergencyCaseId(number: string):Observable<any>{

    let request = "?emergencyCaseId=" + number;

   return this.getObservable(request)
   .pipe(
     map((response:Caller) => {
       return response;
     })
   );

  }
}
