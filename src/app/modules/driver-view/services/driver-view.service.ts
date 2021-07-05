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
  arr!: DriverAssignments[];
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

  public getDriverViewDetails(driverViewDate: Date): Observable<DriverAssignments[]> {

    let request = '?assignmentDate='+ driverViewDate;

    return this.getObservable(request).pipe(
      map((response: any) => {
        this.driverViewDetails.next(response);
        return response;
      })
    );

  }

  public getFilteredAssignmentForDriverView(actionStatusType: String) {
    let filteredArray;
    this.driverViewDetails.subscribe(val=> {
          filteredArray =  val.reduce((filterAssignmentsList: DriverAssignments[],currentAssignmentList: DriverAssignments)=> {

                if(currentAssignmentList.actionStatus === actionStatusType) {
                  filterAssignmentsList.push(currentAssignmentList);
                }
    
                return filterAssignmentsList;
    
              },[]);
              
        });
    return filteredArray;
  }

}



        // this.driverViewDetails.next(response);

        // this.driverViewDetails.subscribe((assignments)=> {

        //   this.inAmbulanceAssignment.next(assignments.filter(data=> data.actionStatus === 'In Ambulance'));
        //   this.inProgressAssignment.next(assignments.filter(data=> data.actionStatus === 'In Progress'));
        //   this.assignedAssignments.next(assignments.filter(data=> data.actionStatus === 'Assigned'));
        //   this.completedAssignments.next(assignments.filter(data=> data.actionStatus === 'Complete'));
        // })