import { OutstandingCase, OutstandingCase2 } from './../../../core/models/outstanding-case';

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinct, map, take, takeLast} from 'rxjs/operators';

import { RescueDetailsService } from './rescue-details.service';

@Injectable({
  providedIn: 'root'
})
export class OutstandingCase2Service {
  

  vechileId$ = new BehaviorSubject<(number| null)[]>([]);


  initialised = false;
  outstandingCases$:BehaviorSubject<OutstandingCase2[]> = new BehaviorSubject<OutstandingCase2[]>([]);
  
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
  getActionStatusId(){
    
  
    return this.outstandingCases$.pipe(
      map(outstandingCases => outstandingCases.map(outstandingCase => outstandingCase.actionStatusId)),
      map(outstandingCases => outstandingCases.filter(outstandingCase => outstandingCase !== null)),
      map(ids => [...new Set(ids)])
    );
   
  
  }
 
  getOutstandingCasesByVehicleId(vehicleId: number | null){
    
    return  this.outstandingCases$.pipe(
      map(outstandingCases => outstandingCases.filter(outstandingCase => outstandingCase.assignedVehicleId === vehicleId)),
    );
    
  }


 
  
}
