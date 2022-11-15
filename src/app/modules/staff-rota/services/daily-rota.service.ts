import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserDetails } from 'src/app/core/models/user';
import { UserDetailsService } from 'src/app/core/services/user-details/user-details.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';

@Injectable({
  providedIn: 'root'
})
export class DailyRotaService {
  userList = new BehaviorSubject<UserDetails[]>([]);

constructor(
  private userDetailsService: UserDetailsService,
  private userOptionsService: UserOptionsService
) {

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

}
