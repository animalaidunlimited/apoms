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

  leaveRequests = new BehaviorSubject<DisplayLeaveRequest[]>([]);

  leaveRequestProtocol$! : Observable<LeaveRequestProtocol[]>;

constructor(
  http: HttpClient
) {
  super(http);
  this.getLeaveRequests();
 }

 // API Calls

 getLeaveRequestProtocol(): Observable<LeaveRequestProtocol[]> {
  const request = '/GetLeaveRequestProtocol';

  if (!this.leaveRequestProtocol$) {
      this.leaveRequestProtocol$ = this.getObservable(request).pipe(
          map((response: LeaveRequestProtocol[]) => {
            
            return response.sort((a,b) => a.sortOrder - b.sortOrder)}),
      );
  }

  return this.leaveRequestProtocol$;
}


getLeaveRequests(startDate?: string, endDate?: string) : void {
  
  this.get(`/GetLeaveRequests?startDate=${startDate}&endDate=${endDate}`).then(requests => {
    this.leaveRequests.next(requests as DisplayLeaveRequest[])
  }
  )

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

}
