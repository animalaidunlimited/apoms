import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from '../http/api.service';

@Injectable({
  providedIn: 'root'
})
export class UserActionService extends APIService{
endpoint = 'UserAdmin';
constructor(public http: HttpClient) { 
  super(http);
}


public async insertUser(userDetails:any): Promise<any> {
  if (userDetails.userUserId) {
    console.log('i was called');
      return await this.put(userDetails);
  } else {
    console.log('no was called');
      return await this.post(userDetails);
  }
}

}