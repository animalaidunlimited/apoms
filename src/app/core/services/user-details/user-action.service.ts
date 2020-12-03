import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from '../http/api.service';

@Injectable({
  providedIn: 'root'
})
export class UserActionService extends APIService{
  endpoint = 'Users';
  constructor(public http: HttpClient) {
    super(http);
  }

  public async insertUser(userDetails:any): Promise<any> {
    if (userDetails.userId) {
      return await this.put(userDetails);
    } else {
      return await this.post(userDetails);
    }
  }

  public getUsersByIdRange(): Promise<any> {
    const request = '?GetUsersByIdRange';
    return this.get(request);
  }

}