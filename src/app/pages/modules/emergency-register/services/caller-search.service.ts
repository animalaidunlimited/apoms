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
        //console.log(JSON.stringify(response));
        return response;
      })
    )
    ;

   }

  // getCallerByNumber(query: string): Observable<CallerNumberResponse> {
  //   const url = 'http://localhost:4500/Caller?number=8905';
  //   return this.http
  //     .get<CallerNumberResponse>(url, {
  //       observe: 'response',
  //       params: {
  //         q: query,
  //         sort: 'number',
  //         order: 'desc'
  //       }
  //     })
  //     .pipe(
  //       map(res => {
  //         return res.body;
  //       })
  //     );
  // }
}
