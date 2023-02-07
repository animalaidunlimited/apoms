import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from '../http/api.service';
import { BehaviorSubject } from 'rxjs';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { UserDetails } from '../../models/user';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';

@Injectable({
  providedIn: 'root'
})
export class UserDetailsService extends APIService{

  endpoint = 'UserAdmin';

  public permissionArray = new BehaviorSubject<number[]>([-1]);
  public permissionCheckComplete = new BehaviorSubject<boolean>(false);

  userList = new BehaviorSubject<UserDetails[]>([]);
  scheduleUserList = new BehaviorSubject<UserDetails[]>([]);

  constructor(
    public http: HttpClient,
    private userOptionsService: UserOptionsService
    ) {
  super(http);
  this.setUserPermissions();
  }

  public initialiseUserList() : Promise<any> {

    if(this.userList.value.length > 0){
      //Let's tell the resolver that we've already loaded the user list.
      return Promise.resolve(true);
    }

    return this.getUsersByIdRange(this.userOptionsService.getUserName()).then((userListData: UserDetails[]) => {
      
      this.userList.next(userListData);

      const scheduleUsers = userListData.filter(user => !user.excludeFromScheduleUsers)

      this.scheduleUserList.next(scheduleUsers)

  
    });

  }

  public getUserList() : BehaviorSubject<UserDetails[]> {

    return this.userList;

  }

  public getScheduleUserList() : BehaviorSubject<UserDetails[]> {

    return this.scheduleUserList;

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

  public deleteUserById(userId: number): Promise<SuccessOnlyResponse> {

    const body = {
      userId
    }

    return this.postSubEndpoint('DeleteUserById', body);
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

  public getUserCode(userId: number) : string {

    let foundUser = this.userList.value.find(user => user.userId === userId);
  
    return foundUser ? `${foundUser.employeeNumber} - ${foundUser.firstName}` : '';
  
   }

   public getUser(userId: number) : UserDetails | undefined {

    return this.userList.value.find(user => user.userId === userId);


   }



}