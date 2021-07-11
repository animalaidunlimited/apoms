
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { skip } from 'rxjs/operators';
import { OutstandingAssigment2 } from 'src/app/core/models/outstanding-case';

import { OutstandingCase2Service } from '../../services/outstanding-case2.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'outstanding-case-board2',
  templateUrl: './outstanding-case-board2.component.html',
  styleUrls: ['./outstanding-case-board2.component.scss']
})
export class OutstandingCaseBoard2Component implements OnInit {

  vehicleId$!: Observable<(number | null)[]>;



  outstandingCases$!:  Observable<OutstandingAssigment2[]>;
  recievedVehicleList$!:  Observable<OutstandingAssigment2[]>;

  loaded = false;

  constructor( 
    private outstandingCase2Service: OutstandingCase2Service) { }

  ngOnInit(): void {
   
    this.vehicleId$ = this.outstandingCase2Service.getVehicleId().pipe(skip(1)); 
 

    this.recievedVehicleList$ = this.outstandingCase2Service.getOutstandingCasesByVehicleId(null);
    this.recievedVehicleList$.subscribe(cases =>  this.loaded = cases.length > 0 ? true : false);

    
  }

 



  


  
  
}
