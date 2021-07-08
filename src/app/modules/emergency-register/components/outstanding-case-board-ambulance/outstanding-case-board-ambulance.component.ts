import { OutstandingCase2 } from 'src/app/core/models/outstanding-case';
import { Component, Input, OnInit } from '@angular/core';
import { OutstandingCase2Service } from '../../services/outstanding-case2.service';
import { Observable } from 'rxjs';
import { filter, map, mergeMap, share, take, toArray } from 'rxjs/operators';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'outstanding-case-board-ambulance',
    templateUrl: './outstanding-case-board-ambulance.component.html',
    styleUrls: ['./outstanding-case-board-ambulance.component.scss']
})
export class OutstandingCaseBoardAmbulanceComponent implements OnInit{
    @Input() vehicleId!:number | null;
    vehicleList$!:Observable<OutstandingCase2[]>;
    constructor (
        private outstandingCase2Service: OutstandingCase2Service
    ) {}



    ngOnInit () {
       this.vehicleList$ =  this.outstandingCase2Service.getOutstandingCasesByVehicleId(this.vehicleId);
  
    }

    getOutstandingCasesByStatusId(statusId:number){
    
        return this.vehicleList$.pipe(
            map(oustandingCases => {
                return oustandingCases.filter(outstandingCase => outstandingCase.actionStatusId === statusId);
            })
        );
 
    }
}