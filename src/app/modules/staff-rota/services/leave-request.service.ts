import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DisplayLeaveRequest, LeaveRequest, LeaveRequestSaveResponse } from 'src/app/core/models/rota';
import { APIService } from 'src/app/core/services/http/api.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LeaveRequestService extends APIService {

  endpoint = 'Rota';

  leaveRequests!: Observable<DisplayLeaveRequest[]>;

  public leavesUpdated = new BehaviorSubject<boolean>(false);

constructor(
  http: HttpClient
) {
  super(http);
 }

 // API Calls

getLeaveRequests() : Observable<DisplayLeaveRequest[]> {

  if(!this.leaveRequests){
    this.leaveRequests = this.getObservable(`/GetLeaveRequests`);
  }

  return this.leaveRequests;

}

getDisplayColumns() : Observable<string[]> {

  return this.leaveRequests.pipe(map(element => Object.keys(element[0])));

}

saveLeaveRequest(leaveRequest: Partial<LeaveRequest>) : Promise<LeaveRequestSaveResponse> {

  return leaveRequest?.leaveRequestId ? this.putSubEndpoint("/LeaveRequest", leaveRequest) : this.postSubEndpoint("/LeaveRequest", leaveRequest);

}

deleteLeaveRequest(leaveRequest: LeaveRequest) : Promise<LeaveRequestSaveResponse> {

  return this.putSubEndpoint("/LeaveRequest", leaveRequest)

}

markLeavesUpdated() : void {
  this.leavesUpdated.next(true);
}

}
