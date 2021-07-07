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

  public async upsertVehicleListItem(vehicleDetail: any) : Promise<SuccessOnlyResponse> {
    if (vehicleDetail.vehicleId) {
      return await this.put(vehicleDetail);
    } else {
      return await this.post(vehicleDetail);
    }
  }

  public getVehicleListTableData(): Promise<any> {
    const request = '?GetVehicleListTableData';
    return this.get(request);
  }

  public async deleteVehicleListItem(vehicleId : number) : Promise<SuccessOnlyResponse> {
    let deleteobject = {
      vehicleId:vehicleId,
      isDeleted: true
    }
    return await this.put(deleteobject).then((output)=>{
      return output;
    }).catch((error:any)=>{
        console.log(error);
    });

  }

  public populateDriverView(driverViewDate: Date) {

    console.log(driverViewDate);

    let request = '?assignmentDate='+ driverViewDate;

    return this.getObservable(request).subscribe(response=> {
      console.log(response);
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