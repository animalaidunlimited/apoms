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
  console.log(userDetails);
  const request = 'User';
  if (userDetails.UserId) {
      return await this.put(userDetails);
  } else {
      return await this.post(userDetails);
  }
}
}