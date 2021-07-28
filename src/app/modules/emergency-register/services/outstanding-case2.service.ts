

import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, interval, Observable, timer } from 'rxjs';
import { filter, map, pairwise, skip, startWith, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import { OutstandingAssignment2 } from 'src/app/core/models/outstanding-case';
import { FilterKeys } from '../components/outstanding-case-board/outstanding-case-board.component';

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

    this.rescueService.getOutstandingRescues2().pipe(take(1),
    map(outstandingCases => 
      outstandingCases.map(outstandingCase => ({...outstandingCase, searchCandidate: false})))
    ).subscribe(outstandingCases =>
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


  getBackstopHospitalTimer(vehicleId:number){
    
    // tslint:disable-next-line: no-shadowed-variable
    const timer = this.outstandingCases$.pipe(
    
      map(outstandingCases => outstandingCases.reduce((newArr:any, outstandingCase) => 
      {
        if(outstandingCase.assignedVehicleId === vehicleId 
          && ( outstandingCase.ambulanceAction === 'Rescue' && outstandingCase.rescueTime !== null 
              || outstandingCase.ambulanceAction === 'Release' && outstandingCase.pickupDate !== null))
        {

          if(outstandingCase.ambulanceAction === 'Rescue' )
          { 
            const rescueTime = new Date(outstandingCase.rescueTime as string);
            if(rescueTime.getDate() === new Date().getDate())
            {
              newArr.push(rescueTime);
            }

          }
          else{

            const pickupTime = new Date(outstandingCase.rescueTime as string);
            if(pickupTime.getDate() === new Date().getDate())
            {
              newArr.push(pickupTime);
            }
          }
            
        }
        
        return newArr;
      }, [])
      ),
      map(outStandingCases => {
          return new Date(new Date(Math.min.apply(null, outStandingCases)).getTime() + 150*60000);
      })
    );

    // return timer;
   
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
   
    const currentTime = new Date();

    if(backToHospital.getTime() - currentTime.getTime() > 0)
    {
      const totalSeconds     = Math.floor((backToHospital.getTime() - currentTime.getTime())/1000);
      const totalMinutes     = Math.floor(totalSeconds/60);
      const totalHours       = Math.floor(totalMinutes/60);
      const totalDays        = Math.floor(totalHours/24);

      const hours   = totalHours - ( totalDays * 24 );
      const minutes = totalMinutes - ( totalDays * 24 * 60 ) - ( hours * 60 );
      const seconds = totalSeconds - ( totalDays * 24 * 60 * 60 ) - ( hours * 60 * 60 ) - ( minutes * 60 );

      
      return ({
        time : `${hours}:${minutes}:${seconds}`,
        class : 'timeLeft'
      }); 

    }
    else{
      const elapsed = currentTime.getTime() - backToHospital.getTime() ;
      const seconds = parseInt((Math.abs(elapsed) / (1000) % 60).toString(),10);
      const minutes = parseInt((Math.abs(elapsed) / (1000 * 60) % 60).toString(),10);
      const hours = parseInt((Math.abs(elapsed) / ((1000 * 60 * 60))).toString(), 10);
      
      if(isNaN(hours))
      {
        return null;
      }else{
        return ({
        time: `${hours}:${minutes}:${seconds}`,
        class: 'timeAgo'
        }); 
      }

    }
  }

 
  filterCases(click$:Observable<any>, cases$:Observable<OutstandingAssignment2[]>, filters:FilterKeys[], until$:Observable<any>){
    
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
  
}
