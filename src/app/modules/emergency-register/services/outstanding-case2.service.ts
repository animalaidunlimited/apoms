

import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, interval, timer } from 'rxjs';
import { filter, map, skip, switchMap, take} from 'rxjs/operators';
import { OutstandingAssignment2 } from 'src/app/core/models/outstanding-case';

import { RescueDetailsService } from './rescue-details.service';

@Injectable({
  providedIn: 'root'
})
export class OutstandingCase2Service {
  

  vechileId$ = new BehaviorSubject<(number| null)[]>([]);


  initialised = false;
  outstandingCases$:BehaviorSubject<OutstandingAssignment2[]> = new BehaviorSubject<OutstandingAssignment2[]>([]);
  
  constructor(
    private rescueService: RescueDetailsService
  ) {
    this.initialise();
   }

  initialise(){
    if(this.initialised){
      return;
    }

    this.initialised = true;

    this.rescueService.getOutstandingRescues2().pipe(take(1)).subscribe(outstandingCases =>
      { 
        if(outstandingCases){
          this.outstandingCases$.next(outstandingCases);
        }
      }
    );

  }

  getVehicleId(){
    
  
    return this.outstandingCases$.pipe(
   
      map(outstandingCases => outstandingCases.map(outstandingCase => outstandingCase.assignedVehicleId)),
      map(outstandingCases => outstandingCases.filter(outstandingCase => outstandingCase !== null)),
      map(ids => [...new Set(ids)]) 
    );
   
  
  }


 
  getOutstandingCasesByVehicleId(vehicleId: number | null){
    
    return  this.outstandingCases$.pipe(
      map(outstandingCases => outstandingCases.filter(outstandingCase => outstandingCase.assignedVehicleId === vehicleId)),
    );
    
  }


  getBackstopHospitalTimer(){
    
    const timer = this.outstandingCases$.pipe(
    
      map(outstandingCases => outstandingCases.reduce((newArr:any, outstandingCase) => 
      {
        if(outstandingCase.assignedVehicleId === 48 
          && ( outstandingCase.ambulanceAction === 'Rescue' && outstandingCase.rescueTime !== null 
              || outstandingCase.ambulanceAction === 'Release' && outstandingCase.pickupDate !== null))
        {
          outstandingCase.ambulanceAction === 'Rescue' ? 
            newArr.push(new Date(outstandingCase.rescueTime as string)) : 
            newArr.push(new Date(outstandingCase.pickupDate as string));
            
        }

        return  newArr;
      }, [])
      ),
      map(outStandingCases => {
          return new Date(new Date(Math.min.apply(null, outStandingCases)).getTime() + 150*60000);
      })
    /*   map(time => time.getDate() >= new Date().getDate() ? time : null) */
    );

    // return timer;
   
    return combineLatest([interval(1000),timer]).pipe(
      map(time => time[1]),
      map(time => time ? this.backToHospitalTimer(time) : null),
    
      filter(time => time !== null)
    ); 
    

  }

  getTimer(){
    return timer(200).pipe(
      switchMap(() => this.getBackstopHospitalTimer()));
  
  }



  backToHospitalTimer(backToHospital: Date){
    const currentTime = new Date();

    const totalSeconds     = Math.floor((backToHospital.getTime() - currentTime.getTime())/1000);
    const totalMinutes     = Math.floor(totalSeconds/60);
    const totalHours       = Math.floor(totalMinutes/60);
    const totalDays        = Math.floor(totalHours/24);

    const hours   = totalHours - ( totalDays * 24 );
    const minutes = totalMinutes - ( totalDays * 24 * 60 ) - ( hours * 60 );
    const seconds = totalSeconds - ( totalDays * 24 * 60 * 60 ) - ( hours * 60 * 60 ) - ( minutes * 60 );

    return (`${hours}:${minutes}:${seconds}`); 
  }

 
}
