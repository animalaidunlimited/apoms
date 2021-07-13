import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from 'src/app/core/services/http/api.service';
import { BehaviorSubject, interval, Observable, Observer, of } from 'rxjs';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
import { map, mapTo } from 'rxjs/operators';
import { DriverAssignments } from 'src/app/core/models/driver-view';
import { CheckConnectionService } from 'src/app/core/services/check-connection/check-connection.service';
// import { DriverAssignments } from "../../../core/models/driver-view";

@Injectable({
  providedIn: 'root'
})

export class DriverViewService extends APIService {
  endpoint = 'DriverView';
  driverViewDetails: BehaviorSubject<DriverAssignments[]> = new BehaviorSubject<DriverAssignments[]>([]);
  driverViewQuestionList: any;

  constructor(public http: HttpClient,
    private checkConnectionService: CheckConnectionService) {
    super(http);

    this.checkConnectionService.checkConnection.subscribe(connection=> {
      JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('driverViewData')))).forEach((item: DriverAssignments)=> {
        if(connection && item.isUpdated) {
            this.saveDriverViewDataFromLocalStorage(item);
        }
      })
    })
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
        
        localStorage.setItem('driverViewData', JSON.stringify(response));

        this.driverViewDetails.next(JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('driverViewData')))));

      }
      else {
        console.log('empty res')
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

    // let array = [];

    // array.push(driverViewUpdatedData);

    // let set = new Set(array);


    // console.log(set)

    console.log(driverViewUpdatedData);

    this.put(driverViewUpdatedData);

    let localData: DriverAssignments[] =  JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('driverViewData'))));

    let index = localData.findIndex(data=> data.emergencyCaseId === driverViewUpdatedData.emergencyCaseId && data.isUpdated === true);

    localData[index].isUpdated = false;

    localStorage.setItem('driverViewData', JSON.stringify(localData))

    
  }

}