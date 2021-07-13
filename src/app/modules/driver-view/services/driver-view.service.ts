import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from 'src/app/core/services/http/api.service';
import { BehaviorSubject, interval, Observable, Observer, of } from 'rxjs';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
import { map, mapTo } from 'rxjs/operators';
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
  driverViewQuestionList: any;

  private source = interval(3000);
  // public online$: Observable<boolean>;

  constructor(public http: HttpClient) {
    super(http);

    // this.online$ = merge(
    //   of(navigator.onLine),
    //   fromEvent(window, 'online').pipe(mapTo(true)),
    //   fromEvent(window, 'offline').pipe(mapTo(false))
    // )

    // this.source.subscribe(()=> {
    //     if(navigator.onLine) {
    //       const value = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('driverViewData'))));
    //       value.forEach((val:DriverAssignments)=> {
    //         if(val.isUpdated) {
    //           this.saveDriverViewDataFromLocalStorage(val);
    //           val.isUpdated = false;
    //         }
    //       })
    //     }
    // })
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

        response.forEach((data: DriverAssignments)=> {
          this.getAssignmentStatus(data);
        })

      

        console.log(response);
        
        localStorage.setItem('driverViewData', JSON.stringify(response));

        this.driverViewDetails.next(JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('driverViewData')))));

      }
      else {
        localStorage.removeItem('driverViewData');
        this.driverViewDetails.next([]);
      }
      
    })

  }

  public getAssignmentByStatus(actionStatusType: String) {

    return this.driverViewDetails.pipe(map(val=> {
      return val.filter(value=> value.actionStatus === actionStatusType);
    }));
  }

  public getDriverViewQuestions() {
    
    const request = '?getDriverViewQuestions';

    return this.getObservable(request).subscribe(response=> {
      localStorage.setItem('driverViewQuestions', JSON.stringify(response));

      this.driverViewQuestionList = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('driverViewQuestions'))));

    })

  }

  public getDriverViewQuestionFormGroupByActionTypeAndSubAction(actionStatus: string, subAction: string) {

    console.log(actionStatus)

    console.log(subAction)

    console.log(this.driverViewQuestionList)

    console.log(this.driverViewQuestionList.filter((value: any)=> value.actionStatus === actionStatus && value.subAction === subAction)
    )

    return this.driverViewQuestionList.filter((value: any)=> value.actionStatus === actionStatus && value.subAction === subAction);

  }

  public getAssignmentStatus(driverViewData: DriverAssignments) {

      if(
        (!driverViewData.ambulanceArrivalTime 
          && !driverViewData.rescueTime 
          && !driverViewData.releaseDetailsId
          && !driverViewData.streetTreatCaseId
        ) || 
        (
          (driverViewData.ambulanceArrivalTime
          && driverViewData.rescueTime
          && driverViewData.admissionTime
          && driverViewData.patientCallOutcomeId === 1
          && driverViewData.inTreatmentAreaId
          && driverViewData.releaseDetailsId
          && !driverViewData.releasePickupDate
          && !driverViewData.releaseBeginDate
          && !driverViewData.releaseEndDate
          && !driverViewData.streetTreatCaseId)
        ) || 
        (
          driverViewData.streetTreatCaseId 
          && !driverViewData.visitBeginDate
		      && !driverViewData.visitEndDate
        )
      ) 
      {
        driverViewData.actionStatus = 'Assigned';
      }
      
      else if(
        (
          driverViewData.ambulanceArrivalTime
          && !driverViewData.rescueTime
          && !driverViewData.releaseDetailsId
          && !driverViewData.streetTreatCaseId
        ) ||
        (
          driverViewData.ambulanceArrivalTime &&
		      driverViewData.rescueTime &&
          driverViewData.admissionTime &&
          driverViewData.patientCallOutcomeId === 1 &&
          driverViewData.inTreatmentAreaId &&
          driverViewData.releaseDetailsId &&
          driverViewData.releasePickupDate &&
          driverViewData.releaseBeginDate &&
          !driverViewData.releaseEndDate &&
          !driverViewData.streetTreatCaseId 
        ) || 
        (
          driverViewData.streetTreatCaseId &&
          driverViewData.visitBeginDate &&
          !driverViewData.visitEndDate 
        )
      ) 
      {
        console.log('hello');
        driverViewData.actionStatus = 'In Progress';
      }

      else if(
        (
          driverViewData.ambulanceArrivalTime &&
		      driverViewData.rescueTime &&
          driverViewData.admissionTime &&
		      driverViewData.patientCallOutcomeId === 1 &&
          driverViewData.inTreatmentAreaId &&
          !driverViewData.releaseDetailsId &&
          !driverViewData.streetTreatCaseId
        ) ||
        (
          driverViewData.ambulanceArrivalTime &&
		      driverViewData.rescueTime &&
          driverViewData.admissionTime &&
          driverViewData.patientCallOutcomeId === 1 &&
          driverViewData.inTreatmentAreaId &&
          driverViewData.releaseDetailsId &&
          driverViewData.releasePickupDate &&
          driverViewData.releaseBeginDate &&
          driverViewData.releaseEndDate &&
          !driverViewData.streetTreatCaseId
        ) ||
        (
          driverViewData.streetTreatCaseId &&
          driverViewData.visitBeginDate &&
          driverViewData.visitEndDate 
        )
      ) 
      {

        driverViewData.actionStatus = 'Complete';
      }

      else if(
        (
          driverViewData.ambulanceArrivalTime &&
          driverViewData.rescueTime &&
          !driverViewData.admissionTime &&
          !driverViewData.patientCallOutcomeId &&
          !driverViewData.inTreatmentAreaId &&
          !driverViewData.releaseDetailsId &&
          !driverViewData.streetTreatCaseId
        ) ||
        (
          driverViewData.ambulanceArrivalTime &&
          driverViewData.rescueTime &&
          driverViewData.admissionTime &&
          driverViewData.patientCallOutcomeId === 1 &&
          driverViewData.inTreatmentAreaId &&
          driverViewData.releaseDetailsId &&
          driverViewData.releasePickupDate &&
          !driverViewData.releaseBeginDate &&
          !driverViewData.releaseEndDate &&
          !driverViewData.streetTreatCaseId
        )
      ) {

        driverViewData.actionStatus = 'In Ambulance'
      }
      else {
        console.log('hi')
      }

      console.log(driverViewData);

    return driverViewData;

  }

  public saveDriverViewDataFromLocalStorage(driverViewUpdatedData: DriverAssignments) {
    console.log(driverViewUpdatedData);
  }

}

function merge<T>(arg0: any, arg1: any, arg2: any) {
  throw new Error('Function not implemented.');
}


function fromEvent(window: Window & typeof globalThis, arg1: string) {
  throw new Error('Function not implemented.');
}
