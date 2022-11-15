import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from '../http/api.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserDetailsService extends APIService{

  endpoint = 'UserAdmin';

  public permissionArray = new BehaviorSubject<number[]>([-1]);
  public permissionCheckComplete = new BehaviorSubject<boolean>(false);

  constructor(public http: HttpClient) {
  super(http);
  this.setUserPermissions();
  }

  public async insertUser(userDetails:any): Promise<any> {
    if (userDetails.userId) {
      return await this.put(userDetails);
    } else {
      return await this.post(userDetails);
    }
  }

  public getUsersByIdRange(username: string): Promise<any> {
    const request = `/GetUsersByIdRange?username=${username}`;
    return this.get(request);
  }

  public getPermissions() : BehaviorSubject<number[]> {

    return this.permissionArray;

  }

  public setUserPermissions() : void {

    const request = '?Username=' + null;

    this.get(request).then(permissionResult => {

      const permissions: number[] = permissionResult as number[];

      this.permissionCheckComplete.next(true);
      this.permissionCheckComplete.complete();

      this.permissionArray.next(permissions);
    })
  }



}