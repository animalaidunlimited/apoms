import { Injectable } from '@angular/core';
import { CrudService } from 'src/app/core/services/http/crud.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CallerNumberResponse } from '../../../../core/models/responses';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CallerSearchService extends CrudService {

  constructor(http: HttpClient) {
    super(http)
   }

   endpoint = 'Caller';

   public getCallerByNumber(number: string):Observable<any>{

     let request = "number=" + number;

    return this.getObservable(request)
    .pipe(
      map((response:CallerNumberResponse) => {
        return response;
      })
    );

   }
}
