import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from 'src/app/core/services/http/api.service';
import { BehaviorSubject } from 'rxjs';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
import { map } from 'rxjs/operators';
import { DriverAssignments } from 'src/app/core/models/driver-view';
import { CheckConnectionService } from 'src/app/core/services/check-connection/check-connection.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
// import { DriverAssignments } from "../../../core/models/driver-view";

@Injectable({
  providedIn: 'root'
})

export class DriverViewService extends APIService {
  endpoint = 'DriverView';
  driverViewDetails: BehaviorSubject<DriverAssignments[]> = new BehaviorSubject<DriverAssignments[]>([]);
  driverViewQuestionList: any;
  driverDataSaveErrorResponse: SuccessOnlyResponse[] = [];
  updateAssignmentCount = 0;


  constructor(public http: HttpClient,
    private checkConnectionService: CheckConnectionService,
    private snackBar: SnackbarService) {
    super(http);

    this.checkConnectionService.checkConnection.subscribe(connection=> {

      JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('driverViewData'))))?.forEach((item: DriverAssignments)=> {
        if(connection && item.isUpdated) {
          this.updateAssignmentCount++;
          this.saveDriverViewDataFromLocalStorage(item);
        }

      });

      if(connection && this.updateAssignmentCount > 0) {
        this.updateAssignmentCount = this.showSaveResponseStatus(this.driverDataSaveErrorResponse);
      }

    });

  }

  public populateDriverView(driverViewDate: any) {



    const request = '?assignmentDate='+ driverViewDate;

    return this.getObservable(request).subscribe(response=> {

      if(response){

        response.forEach((data: DriverAssignments)=> {
          this.getAssignmentStatus(data);
        })

        localStorage.setItem('driverViewData', JSON.stringify(response));

        this.driverViewDetails.next(JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('driverViewData')))));

      }
      else {
        localStorage.removeItem('driverViewData');
        this.driverViewDetails.next([]);
      }

    })

  }

  public getAssignmentByStatus(actionStatusType: string) {

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

    return this.driverViewQuestionList.filter((value: any)=> value.actionStatus === actionStatus && value.subAction === subAction);

  }

  public getAssignmentStatus(driverViewData: DriverAssignments) {

     driverViewData?.patients.forEach(patient=> {
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
          && patient.callOutcome.CallOutcome?.CallOutcomeId === 1
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
      
      if(
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
          patient.callOutcome.CallOutcome?.CallOutcomeId === 1 &&
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

        driverViewData.actionStatus = 'In Progress';
      }

      if(
        (
          driverViewData.ambulanceArrivalTime &&
          driverViewData.rescueTime &&
          !driverViewData.admissionTime &&
          !patient.callOutcome.CallOutcome?.CallOutcomeId &&
          !driverViewData.inTreatmentAreaId &&
          !driverViewData.releaseDetailsId &&
          !driverViewData.streetTreatCaseId
        ) ||
        (
          driverViewData.ambulanceArrivalTime &&
          driverViewData.rescueTime &&
          driverViewData.admissionTime &&
          patient.callOutcome.CallOutcome?.CallOutcomeId === 1 &&
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

      if(
        (
          driverViewData.rescueTime &&
          driverViewData.ambulanceArrivalTime &&
          driverViewData.admissionTime &&
		      // patient.callOutcome.CallOutcome?.CallOutcomeId === 1 &&
          // patient.admissionArea &&
          !driverViewData.releaseDetailsId &&
          !driverViewData.streetTreatCaseId
        ) ||
        (
          driverViewData.ambulanceArrivalTime &&
		      driverViewData.rescueTime &&
          driverViewData.admissionTime &&
          // patient.callOutcome.CallOutcome?.CallOutcomeId === 1 &&
          // driverViewData.inTreatmentAreaId &&
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

      
      
    });

    return driverViewData;

  }

  public saveDriverViewDataFromLocalStorage(driverViewUpdatedData: DriverAssignments) {


    let response = this.put(driverViewUpdatedData);

    response.then((val:SuccessOnlyResponse)=> {
     if(val.success===1) {

       let localData: DriverAssignments[] =  JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('driverViewData'))));

       let index = localData.findIndex(data=> data.emergencyCaseId === driverViewUpdatedData.emergencyCaseId && data.isUpdated === true);

       localData[index].isUpdated = false;

       localStorage.setItem('driverViewData', JSON.stringify(localData));
     }

     else{
      this.driverDataSaveErrorResponse.push(val);
     }
    });

  }


  public showSaveResponseStatus(updatedItemError: SuccessOnlyResponse[] ) {

    if(updatedItemError.length > 0) {
      this.snackBar.errorSnackBar('Some cases not synced with database, Please try again later!', 'Ok');
    }
    else if(updatedItemError.length === 0) {
      this.snackBar.successSnackBar('All cases synced with database.', 'Ok')
    }

    return 0;
  }

}