import { Resolve } from '@angular/router';
import { Injectable } from '@angular/core';
import { UserDetailsService } from 'src/app/core/services/user-details/user-details.service';

@Injectable({
    providedIn: 'root',
  })
  
export class UserListResolver implements Resolve<any> {

  constructor(private UserDetailsService: UserDetailsService) {}

  async resolve() {
    return await this.UserDetailsService.initialiseUserList();    
  }

}