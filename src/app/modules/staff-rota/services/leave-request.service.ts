import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DisplayLeaveRequest, LeaveRequest, LeaveRequestProtocol, LeaveRequestSaveResponse } from 'src/app/core/models/rota';
import { APIService } from 'src/app/core/services/http/api.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LeaveRequestService extends APIService {

  endpoint = 'Rota';

  leaveRequests!: Observable<DisplayLeaveRequest[]>;

  leaveRequestProtocol$! : Observable<LeaveRequestProtocol[]>;

  public leavesUpdated = new BehaviorSubject<boolean>(false);

constructor(
  http: HttpClient
) {
  super(http);
 }

 // API Calls

 getLeaveRequestProtocol(): Observable<LeaveRequestProtocol[]> {
  const request = '/GetLeaveRequestProtocol';

  if (!this.leaveRequestProtocol$) {
      this.leaveRequestProtocol$ = this.getObservable(request).pipe(
          map((response: LeaveRequestProtocol[]) => {

            console.log(response);
            
            return response.sort((a,b) => a.sortOrder - b.sortOrder)}),
      );
  }

  return this.leaveRequestProtocol$;
}

getLeaveRequests() : Observable<DisplayLeaveRequest[]> {
  
    return this.getObservable(`/GetLeaveRequests`);

}

getLeaveRequestsForUser(userId: number) : Observable<DisplayLeaveRequest[]> {

  return this.getObservable(`/GetLeaveRequestsForUser?userId=${userId}`);

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
