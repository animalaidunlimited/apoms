
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map} from 'rxjs/operators';

import { RescueDetailsService } from './rescue-details.service';

@Injectable({
  providedIn: 'root'
})
export class OutstandingCase2Service {
  

  vechileId$ = new BehaviorSubject<(number| null)[]>([]);
  constructor(
    private rescueService: RescueDetailsService
  ) { }

  getVehicleId(){
    return this.rescueService.getOutstandingRescues2().pipe(

      map(ids => {
        if(ids){
          return [...new Set(ids.map(c => c.assignedVehicleId))].filter(id => id!== null );
        }
        else{
          return [];
        }
      }),
    );
  
  }

  getOutstandingCasesByVehicleId(vehicleId: number | null){

    return this.rescueService.getOutstandingRescues2().pipe(
      map(cases => cases.filter(r => r.assignedVehicleId === vehicleId) )
    );
    
  }


 
  
}
