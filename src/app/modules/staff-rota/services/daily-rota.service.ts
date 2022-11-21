import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
import { RotaDayAssignment } from 'src/app/core/models/rota';
import { UserDetails } from 'src/app/core/models/user';
import { UserDetailsService } from 'src/app/core/services/user-details/user-details.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { APIService } from 'src/app/core/services/http/api.service';

@Injectable({
  providedIn: 'root'
})
export class DailyRotaService extends APIService{

  endpoint = 'Rota';

  userList = new BehaviorSubject<UserDetails[]>([]);


constructor(
  http: HttpClient,
  private userDetailsService: UserDetailsService,
  private userOptionsService: UserOptionsService
) {
  super(http);
  this.initialiseUserList()

 }

 initialiseUserList() : void {
  this.userDetailsService.getUsersByIdRange(this.userOptionsService.getUserName()).then((userListData: UserDetails[])=>{
      
    this.userList.next(userListData); 

  });
 }

getUserList() : BehaviorSubject<UserDetails[]> {

  return this.userList;

}

saveAssignment(assignment: RotaDayAssignment) : Promise<SuccessOnlyResponse> {

  console.log(assignment);

  return this.putSubEndpoint(`RotaDayAssignment`, assignment);


}

}
