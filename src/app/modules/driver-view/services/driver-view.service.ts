import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from 'src/app/core/services/http/api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
import { map, reduce } from 'rxjs/operators';
import { DriverAssignments } from 'src/app/core/models/driver-view';
// import { DriverAssignments } from "../../../core/models/driver-view";

@Injectable({
  providedIn: 'root'
})

export class DriverViewService extends APIService {
  endpoint = 'DriverView';
  driverViewDetails: BehaviorSubject<DriverAssignments[]> = new BehaviorSubject<DriverAssignments[]>([]);
  inAmbulanceAssignment: BehaviorSubject<DriverAssignments[]> = new BehaviorSubject<DriverAssignments[]>([]);
  inProgressAssignment: BehaviorSubject<DriverAssignments[]> = new BehaviorSubject<DriverAssignments[]>([]);
  assignedAssignments: BehaviorSubject<DriverAssignments[]> = new BehaviorSubject<DriverAssignments[]>([]);
  completedAssignments: BehaviorSubject<DriverAssignments[]> = new BehaviorSubject<DriverAssignments[]>([]);

  constructor(public http: HttpClient) {
    super(http);
  }

  public populateDriverView(driverViewDate: Date) {

    let request = '?assignmentDate='+ driverViewDate;

    return this.getObservable(request).subscribe(response=> {
      if(response){
        this.driverViewDetails.next(response);
      }
      else {
        this.driverViewDetails.next([]);
      }

    })

  }

  public getAssignmentByStatus(actionStatusType: String) {

    return this.driverViewDetails.pipe(map(val=> {
      return val.filter(value=> value.actionStatus === actionStatusType);
    }));
  }

}