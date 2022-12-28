import { Resolve } from '@angular/router';
import { Injectable } from '@angular/core';
import { LeaveRequestService } from '../services/leave-request.service';

@Injectable({
    providedIn: 'root',
  })
  
export class LeaveRequestResolver implements Resolve<any> {

  constructor(private requestService: LeaveRequestService) {}

  async resolve() {
    return await this.requestService.initialiseProtocol();    
  }

}