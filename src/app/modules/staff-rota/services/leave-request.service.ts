import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DisplayLeaveRequest, Festival, LeaveRequest, LeaveRequestProtocol, LeaveRequestSaveResponse } from 'src/app/core/models/rota';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { APIService } from 'src/app/core/services/http/api.service';

@Injectable({
  providedIn: 'root'
})
export class LeaveRequestService extends APIService {

  endpoint = 'Rota';

  leaveRequests = new BehaviorSubject<DisplayLeaveRequest[]>([]);

  leaveRequestProtocol$ = new BehaviorSubject<LeaveRequestProtocol[]>([]);

  festivals: Festival[] = [];

constructor(
  http: HttpClient,
  private dropdown: DropdownService
) {
  super(http);
  this.getLeaveRequests();

  
 }

 async initialiseProtocol() {

  this.getFestivals()

  if(this.leaveRequestProtocol$.value.length > 0){
    //Let's tell the resolver that we've already loaded the user list.
    return Promise.resolve(true);
  }

  return this.getLeaveRequestProtocol().then((sortedResponse: LeaveRequestProtocol[]) => this.leaveRequestProtocol$.next(sortedResponse));

 }

 getFestivals() : void {

  this.dropdown.getFestivals().subscribe(festivals => this.festivals = festivals);

 }

 // API Calls

 async getLeaveRequestProtocol(): Promise<LeaveRequestProtocol[]> {
  const request = '/GetLeaveRequestProtocol';

  return this.get(request).then(response => response as LeaveRequestProtocol[])
                  .then(response => response.sort((a,b) => a.sortOrder - b.sortOrder));

}




getLeaveRequests() : void {

  this.getLeaveRequestsForPeriod().then(requests => 
    this.leaveRequests.next(requests as DisplayLeaveRequest[])
  )

}

getLeaveRequestsForPeriod(startDate?: string, endDate?: string) : Promise<LeaveRequest[] | null> {
  
  return this.get(`/GetLeaveRequests?startDate=${startDate}&endDate=${endDate}`);

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

getNonFestivalNoticeDays(numberOfDays: number) : number {

  return this.leaveRequestProtocol$.value
  .sort((a,b) => a.dayRangeEnd - b.dayRangeEnd)
  .find(element => numberOfDays <= element.dayRangeEnd)?.noticeDaysRequired || 0;

}

getFestivalNoticeDays(selectedFestival : number) : number {
  
  return this.festivals.find(festival => festival?.festivalId === selectedFestival)?.noticeDaysRequired || 30;

}

}
