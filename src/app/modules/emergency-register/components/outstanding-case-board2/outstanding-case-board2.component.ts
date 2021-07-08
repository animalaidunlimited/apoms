import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { OutstandingCase2 } from 'src/app/core/models/outstanding-case';

import { OutstandingCase2Service } from '../../services/outstanding-case2.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'outstanding-case-board2',
  templateUrl: './outstanding-case-board2.component.html',
  styleUrls: ['./outstanding-case-board2.component.scss']
})
export class OutstandingCaseBoard2Component implements OnInit {



  vehicleId$!: Observable<(number | null)[]>;
  recievedVehicleList$!:  Observable<OutstandingCase2[]>;

  constructor( 
    private outstandingCase2Service: OutstandingCase2Service) { }

  ngOnInit(): void {
    
    this.recievedVehicleList$ =  this.outstandingCase2Service.getOutstandingCasesByVehicleId(null);
    this.vehicleId$ = this.outstandingCase2Service.getVehicleId();
  }



  
}
