import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from '../http/api.service';
import { Observable } from 'rxjs';
import { UserDetails } from 'src/app/pages/users-page/users-page.component';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserActionService extends APIService{
  endpoint = 'UserAdmin';
  constructor(public http: HttpClient) { 
    super(http);
  }


  public async insertUser(userDetails:any): Promise<any> {
    console.log(userDetails);
    if (userDetails.userId) {
      return await this.put(userDetails);
    } else {
      return await this.post(userDetails);
    }
  }

  public getUsersByIdRange(): Observable<UserDetails[]> {
    const request = '?GetUsersByIdRange';
    return this.getObservable(request).pipe(
      map((response:UserDetails[]) => {
          return response;
      }),
  );

  }


}