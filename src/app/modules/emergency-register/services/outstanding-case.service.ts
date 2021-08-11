import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, combineLatest, interval, Observable, timer } from 'rxjs';
import { filter, map, switchMap, takeUntil} from 'rxjs/operators';
import { OutstandingAssignment } from 'src/app/core/models/outstanding-case';
import { FilterKeys } from '../components/outstanding-case-board/outstanding-case-board.component';
import { RescueDetailsService } from './rescue-details.service';
import { ThemePalette } from '@angular/material/core';
import { DriverAssignment } from 'src/app/core/models/driver-view';

@Injectable({
  providedIn: 'root'
})
export class OutstandingCaseService {

  autoRefreshState = false;
  
  vehicleId$ = new BehaviorSubject<(number| null)[]>([]);
  loading = new BehaviorSubject<boolean>(true);

  autoRefresh:BehaviorSubject<boolean> = new BehaviorSubject(Boolean(false));

  refreshColour:BehaviorSubject<ThemePalette> = new BehaviorSubject('primary' as ThemePalette);
  outstandingCases$:BehaviorSubject<OutstandingAssignment[]> = new BehaviorSubject<OutstandingAssignment[]>([]);
  haveReceivedFocus:BehaviorSubject<boolean> = new BehaviorSubject(Boolean(false));
  
  constructor(
    private rescueService: RescueDetailsService,
    private zone:NgZone
  ) {
    
   }

  initialise(){

    this.rescueService.getOutstandingRescues().pipe(
    map(outstandingCases => 
      outstandingCases.map(outstandingCase => ({...outstandingCase, searchCandidate: false})))
    ).subscribe(outstandingCases =>
      { 
  
        if(outstandingCases){
     
          this.outstandingCases$.next(outstandingCases);
          
          this.zone.run(() => this.refreshColour.next('primary'));

          this.loading.next(false);

        }
      }
    );

  }

  getVehicleId(){
   
    return this.outstandingCases$.pipe(
   
      map(outstandingCases => outstandingCases.map(outstandingCase => 
        outstandingCase.ambulanceAction === 'Rescue' ? outstandingCase.rescueAmbulanceId : outstandingCase.releaseAmbulanceId
      )),
      map(outstandingCases => outstandingCases.filter(outstandingCase => outstandingCase !== null)),
      map(ids => [...new Set(ids)]) 

    );
   
  
  }


 
  getOutstandingCasesByVehicleId(vehicleId: number | null){
    
    return  this.outstandingCases$.pipe(
     
      map(outstandingCases => outstandingCases.filter(outstandingCase => 
        vehicleId === (outstandingCase.ambulanceAction === 'Rescue' ? outstandingCase.rescueAmbulanceId : outstandingCase.releaseAmbulanceId )
      )),

    );
    
  }


  getBackstopHospitalTimer(vehicleId:number){
    
    // tslint:disable-next-line: no-shadowed-variable
    const timer = this.outstandingCases$.pipe(
    
      map(outstandingCases => outstandingCases.reduce((newArr:any, outstandingCase) => 
      {
        if(vehicleId === (outstandingCase.ambulanceAction === 'Rescue' ? outstandingCase.rescueAmbulanceId : outstandingCase.releaseAmbulanceId )
          && ( outstandingCase.ambulanceAction === 'Rescue' && outstandingCase.rescueTime !== null 
              || outstandingCase.ambulanceAction === 'Release' && outstandingCase.releasePickupDate !== null))
        {

          if(outstandingCase.ambulanceAction === 'Rescue')
          { 
            const rescueTime = new Date(outstandingCase.rescueTime as string);
            if(rescueTime.getDate() === new Date().getDate())
            {
              newArr.push(rescueTime);
            }

          }
          else{

            const pickupTime = new Date(outstandingCase.releasePickupDate as string);
            if(pickupTime.getDate() === new Date().getDate())
            {
              newArr.push(pickupTime);
            }
            
          }
            
        }
        
        
        return newArr;
      }, [])
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

  getTimer(vehicleId:number){
    
    return timer(200).pipe(
      switchMap(() => this.getBackstopHospitalTimer(vehicleId))
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
        return null;
      }else{
    
        return ({
        time: `- ${formatTime(hours,minutes)}`,
        class: 'timeAgo'
        }); 
      }

    }
  }

  receiveUpdatedRescueMessage(updatedAssignment:DriverAssignment ){

    console.log(updatedAssignment);
    // tslint:disable-next-line: no-shadowed-variable
    const updateCases = (outstandingCases: any, Assignment:any) => {
      const res:any = {};
      Object.keys(outstandingCases)
            .forEach(k => res[k] = (Assignment[k] ?? outstandingCases[k]));
      return res;
    };



    const outstandingCases = this.outstandingCases$?.value;
    
    const existingCaseIndex = outstandingCases.findIndex( c  => c.emergencyNumber === updatedAssignment.emergencyNumber);

    if(existingCaseIndex > -1){

      outstandingCases[existingCaseIndex] = updateCases(outstandingCases[existingCaseIndex],updatedAssignment);

      outstandingCases[existingCaseIndex].moved = true;
      if(updatedAssignment.ambulanceAction !== null){
       
        // tslint:disable-next-line: max-line-length
        updatedAssignment.ambulanceAction === 'Rescue' ? 
          outstandingCases[existingCaseIndex].rescueAmbulanceId =  updatedAssignment.rescueAmbulanceId : 
          outstandingCases[existingCaseIndex].releaseAmbulanceId =  updatedAssignment.releaseAmbulanceId;

      }

    }else{
      const driverAssignment = { 
        ...updatedAssignment,
        assignedVehicleId : updatedAssignment.ambulanceAction === 'Rescue' ? updatedAssignment.rescueAmbulanceId : updatedAssignment.releaseAmbulanceId,
        ambulanceAssignmentTime: updatedAssignment.ambulanceAction === 'Rescue' ? updatedAssignment.rescueAmbulanceAssignmentDate : updatedAssignment.releaseAmbulanceAssignmentDate
      };

     // outstandingCases.push(driverAssignment );
    }
    
    
    this.outstandingCases$.next(outstandingCases);


  }


 /*  setMoved(o:any, emergencyCaseId:number, releaseId: number, moved:boolean, timeout:boolean){


    // Search for the rescue and update its moved flag depending on whether this function
    // is being called by itself or not
      if( o?.emergencyCaseId === emergencyCaseId && o?.releaseId === releaseId){

        o.moved = moved;

        if(!timeout){
          setTimeout(() => 

            this.outstandingCases$.subscribe(cases => this.setMoved(cases, emergencyCaseId, releaseId, false, true))

          , 3500);
        }

      }
      
      let result;
      let p;

      for (p in o) {
          if( o.hasOwnProperty(p) && typeof o[p] === 'object' ) {
              result = this.setMoved(o[p], emergencyCaseId, releaseId, moved, timeout);
          }
      }

      return o;

  } */

 
  filterCases(click$:Observable<any>, cases$:Observable<OutstandingAssignment[]>, filters:FilterKeys[], until$:Observable<any>){
    
    return combineLatest(click$, cases$).pipe(
      takeUntil(until$),
      map(chipChangeObs => chipChangeObs[1]),
      map(outstandingCases => { 

        if(filters.length > 0)
        {

          let filteredOutstandingCases:any = [];

          filters.forEach((keyObject,index)=>{

          const key = keyObject.group;
          index === 0 ?
            filteredOutstandingCases.push(outstandingCases.filter((cases:any) => 

              key === 'animalType' ? 
                cases?.patients?.some((patient:any) => patient[key] === keyObject.value)
              :
                cases[key] === keyObject.value

            ))
          :
            filteredOutstandingCases = filteredOutstandingCases.flat().filter((filteredCase:any) => 

              key === 'animalType' ? 
                filteredCase?.patients?.some((patient:any) => patient[key] === keyObject.value)
              :
                filteredCase[key] === keyObject.value

            ); 
          
          });

          return filteredOutstandingCases.flat();

        }else{

          return outstandingCases;

        }
       
      })
    ); 
  }

  onSearchChange(searchValue:string ){

  
    this.outstandingCases$.value.forEach(outstandingCase => {

      const currentValue = this.convertObjectToString(outstandingCase);
      if(currentValue.toLowerCase().indexOf(searchValue) > -1 && searchValue !== '') {
        outstandingCase.searchCandidate = true;
      }else{
        outstandingCase.searchCandidate = false;
      }

    }); 
      
       
  }



  convertObjectToString(assignment : any){

    let result = '';
    if(assignment) {
      result = Object.entries(assignment).reduce((currentValue: string, val: any)=>{

        if(typeof val[1] === 'object') {
          currentValue += this.convertObjectToString(val[1]);
        }
        else if(typeof val[1] !== 'number' || val[0]==='emergencyNumber') {
          currentValue += currentValue + val[1] + '◬';
        }
        return currentValue;
      },'');
    }

    return result;

  }

  getAutoRefresh(){
    return this.autoRefresh;
  }

  setAutoRefresh(value:boolean){
    this.zone.run(() => this.autoRefresh.next(value));

  }

  toggleAutoRefresh(){

    let currentValue:boolean;

    this.autoRefresh.subscribe(value => {
      currentValue = value;
    });

    this.zone.run(() => this.autoRefresh.next(!currentValue));


  }

  receiveFocus(){
    this.zone.run(() => this.haveReceivedFocus.next(true));

  }
  
}
