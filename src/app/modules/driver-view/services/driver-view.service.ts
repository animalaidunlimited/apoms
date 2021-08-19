import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from 'src/app/core/services/http/api.service';
import { BehaviorSubject, interval } from 'rxjs';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { DriverAssignment } from 'src/app/core/models/driver-view';
import { CheckConnectionService } from 'src/app/core/services/check-connection/check-connection.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { timer } from 'rxjs';
import { combineLatest } from 'rxjs';
import { Patient } from 'src/app/core/models/patients';
import { OnlineStatusService } from 'src/app/core/services/online-status/online-status.service';

@Injectable({
  providedIn: 'root'
})

export class DriverViewService extends APIService {
  endpoint = 'DriverView';
  driverViewDetails: BehaviorSubject<DriverAssignment[]> = new BehaviorSubject<DriverAssignment[]>([]);
  driverViewQuestionList: any;
  driverDataSaveErrorResponse: SuccessOnlyResponse[] = [];
  updateAssignmentCount = 0;


  constructor(public http: HttpClient,
    private checkConnectionService: CheckConnectionService,
    private onlineStatus: OnlineStatusService,
    private snackBar: SnackbarService) {
    super(http);

    this.onlineStatus.connectionChanged.subscribe(connection=> {

      JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('driverViewData'))))?.forEach((item: DriverAssignment)=> {
        if(connection && item.isUpdated) {
          this.updateAssignmentCount++;
          this.saveDriverViewDataFromLocalStorage(item);
        }

      });

      if(connection && this.updateAssignmentCount > 0) {
        console.log(2);
        this.updateAssignmentCount = this.showSaveResponseStatus(this.driverDataSaveErrorResponse);
      }

    });

  }

  public populateDriverView(driverViewDate: any) {



    const request = '?assignmentDate='+ driverViewDate;

    return this.getObservable(request).subscribe(response=> {

      if(response){

        response.forEach((data: DriverAssignment)=> {
          this.getAssignmentStatus(data);
        })

        localStorage.setItem('driverViewData', JSON.stringify(response));

        this.driverViewDetails.next(JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('driverViewData')))));

      }
      else {
        localStorage.setItem('driverViewData',JSON.stringify([]));
        this.driverViewDetails.next([]);
      }

    });

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

    });

  }

  public getDriverViewQuestionFormGroupByActionTypeAndSubAction(actionStatus: string, subAction: string) {

    return this.driverViewQuestionList.filter((value: any)=> value.actionStatus === actionStatus && value.subAction === subAction);

  }

  public getAssignmentStatus(driverViewData: DriverAssignment) {

    console.log(driverViewData);

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
          && driverViewData.ambulanceAction==='STRelease' ? driverViewData.streetTreatCaseId : !driverViewData.streetTreatCaseId)
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
          driverViewData.ambulanceAction==='STRelease' ? (driverViewData.streetTreatCaseId && driverViewData.visitBeginDate) : !driverViewData.streetTreatCaseId
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
          driverViewData.ambulanceAction === 'STRelease' ? driverViewData.streetTreatCaseId : !driverViewData.streetTreatCaseId
        )
      ) {
        driverViewData.actionStatus = 'In Ambulance';
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
          driverViewData.ambulanceAction==='STRelease' ? (driverViewData.streetTreatCaseId && driverViewData.visitEndDate) : !driverViewData.streetTreatCaseId
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

  public async saveDriverViewDataFromLocalStorage(driverViewUpdatedData: DriverAssignment) { 

    await this.put(driverViewUpdatedData).then((val:SuccessOnlyResponse)=> {
      if(val.success===1) {
 
        let localData: DriverAssignment[] =  JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('driverViewData'))));
 
        let index = localData.findIndex(data=> data.emergencyCaseId === driverViewUpdatedData.emergencyCaseId && data.isUpdated === true);
 
        localData[index].isUpdated = false;
 
        localStorage.removeItem('driverViewData');
 
        localStorage.setItem('driverViewData', JSON.stringify(localData));
      }
      else{
       this.driverDataSaveErrorResponse.push(val);
      }
    }).catch(async error=> {
      if (error.status === 504 || !this.onlineStatus.connectionChanged.value) {
        this.onlineStatus.updateOnlineStatusAfterUnsuccessfulHTTPRequest();
    }
    });
  }


  

  public recieveUpdateDriverViewMessage(updatedRecord:DriverAssignment) {

    const updatedRecordData = this.getAssignmentStatus(updatedRecord);

    let uId = Number(localStorage.getItem('UserId'));

    if(updatedRecordData.rescuerList.includes(uId)) {
      const driverViewLocalStorageData: DriverAssignment[] = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('driverViewData'))));
      const index = driverViewLocalStorageData?.findIndex(value=> value.emergencyCaseId === updatedRecordData.emergencyCaseId && 
      this.checkAllPatientIds(updatedRecordData.patients, value));

      console.log(index)
      if(index >=0) 
      {
        driverViewLocalStorageData.splice(index,1,updatedRecordData);
        this.driverViewDetails.next(driverViewLocalStorageData);
        localStorage.removeItem('driverViewData');
        localStorage.setItem('driverViewData', JSON.stringify(driverViewLocalStorageData));
        
      }
      else {
        driverViewLocalStorageData.push(updatedRecordData);
        this.driverViewDetails.next(driverViewLocalStorageData);
        localStorage.removeItem('driverViewData');
        localStorage.setItem('driverViewData', JSON.stringify(driverViewLocalStorageData));
        
      }

    }
    // {
    //   const driverViewLocalStorageData: DriverAssignments[] = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('driverViewData'))));

    //   const index = driverViewLocalStorageData?.findIndex(value=> value.emergencyCaseId === updatedRecordData.emergencyCaseId && 
    //   this.checkAllPatientIds(updatedRecordData.patients, value)) || -1;
  
    //   if(index < 0) {
    //     driverViewLocalStorageData.push(updatedRecordData);
    //     localStorage.setItem('driverViewData', JSON.stringify(driverViewLocalStorageData));
    //     this.driverViewDetails.next(driverViewLocalStorageData);
    //   }
    //   else {
    //     driverViewLocalStorageData.splice(index,1,updatedRecordData);
    //     localStorage.setItem('driverViewData', JSON.stringify(driverViewLocalStorageData));

    //     this.driverViewDetails.next(driverViewLocalStorageData);
    //   }

    // }

   
  }


  checkAllPatientIds(updatedRecordPatients: Patient[], driverViewData: DriverAssignment) {
    
    return driverViewData.patients.every(patient=> {
      return updatedRecordPatients.findIndex(p=> p.patientId === patient.patientId)>-1 ? true : false;
    });
  }


  public showSaveResponseStatus(updatedItemError: SuccessOnlyResponse[] ) {

    if(updatedItemError.length > 0) {
      this.snackBar.errorSnackBar('Some cases not synced with database, Please try again later!', 'Ok');
    }
    else if(updatedItemError.length === 0) {
      this.snackBar.successSnackBar('All cases synced with database.', 'Ok');
    }

    return 0;
  }


  // Using the same code again from the outstanding case service but need to refactor it so that the same code works for both board and driver view.
  getTimer(){
    return timer(200).pipe(
      switchMap(() => this.getBackstopHospitalTimer())
    );
  
  }

  getBackstopHospitalTimer() {

    const timer = this.driverViewDetails.pipe(
      map(driverViewCases=> 
      driverViewCases.reduce((newArr:any, driverCase)=> {
        if(driverCase.ambulanceAction==='Rescue' && driverCase.rescueTime !== null && driverCase.actionStatus!=='Complete') {
            const rescueTime = new Date(driverCase.rescueTime as string);
            if(rescueTime.getDate() === new Date().getDate())
            {
              newArr.push(rescueTime);
            }
                  
          }
          
          if(driverCase.ambulanceAction==='Release' && driverCase.releasePickupDate !== null && driverCase.actionStatus!=='Complete') {
  
            const pickupTime = new Date(driverCase.releasePickupDate as string);
            if(pickupTime.getDate() === new Date().getDate())
            {
              newArr.push(pickupTime);
            }
  
          }
          
          if(driverCase.ambulanceAction==='StreetTreat' && driverCase.visitBeginDate !== null && driverCase.actionStatus!=='Complete') {
  
            const visitBeginDate = new Date(driverCase.visitBeginDate as string);
            if(visitBeginDate.getDate() === new Date().getDate())
            {
              newArr.push(visitBeginDate);
            }
  
          }
          
          if(driverCase.ambulanceAction==='STRelease' && driverCase.actionStatus!=='Complete') {
  
            if(driverCase.releasePickupDate && !driverCase.releaseEndDate) {
              const pickupTime = new Date(driverCase.releasePickupDate as string);
              if(pickupTime.getDate() === new Date().getDate())
              {
                newArr.push(pickupTime);
              }
            }
  
            else if(driverCase.releaseEndDate && driverCase.visitBeginDate && !driverCase.visitEndDate) {
              const visitBeginDate = new Date(driverCase.releasePickupDate as string);
              if(visitBeginDate.getDate() === new Date().getDate())
              {
                newArr.push(visitBeginDate);
              }
            } 
          }
          return newArr;
      },[])
    ), 
    map(datesArray => {
      return new Date(new Date(Math.min.apply(null, datesArray)).getTime() + 150*60000);
    })
    );

    return combineLatest([interval(1000),timer]).pipe(
      map(time => time[1]),
      map(time => time ? this.backToHospitalTimer(time) : null),
    
      filter(time => time !== null)
    ); 

  }

  
     

  backToHospitalTimer(backToHospital: Date){

    const formatTime = (hours:number,minutes:number) => {
      return `${hours < 10 ? `0${hours}`: `${hours}`}:${minutes < 10 ? `0${minutes}`: `${minutes}`}`;
    };
   
    const currentTime = new Date();

  
    
    if(backToHospital.getTime() - currentTime.getTime() > 0)
    {
      const totalSeconds     = Math.floor((backToHospital.getTime() - currentTime.getTime())/1000);
      const totalMinutes     = Math.floor(totalSeconds/60);
      const totalHours       = Math.floor(totalMinutes/60);
      const totalDays        = Math.floor(totalHours/24);

      const hours   = totalHours - ( totalDays * 24 );
      const minutes = totalMinutes - ( totalDays * 24 * 60 ) - ( hours * 60 );
      
      
     
      return ({
        time : formatTime(hours,minutes),
        class : 'timeLeft'
      }); 

    }
    else{
      const elapsed = currentTime.getTime() - backToHospital.getTime() ;

      const minutes = parseInt((Math.abs(elapsed) / (1000 * 60) % 60).toString(),10);
      const hours = parseInt((Math.abs(elapsed) / ((1000 * 60 * 60))).toString(), 10);

     
     
      if(isNaN(hours))
      {
        return ({
          time : '2:30',
          class : 'timeLeft'
        });
      }else{
    
        return ({
        time: `- ${formatTime(hours,minutes)}`,
        class: 'timeAgo'
        }); 
      }

    }
  }


}
