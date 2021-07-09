import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { delay, map, skip, take } from 'rxjs/operators';
import { MediaDialogComponent } from 'src/app/core/components/media/media-dialog/media-dialog.component';
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

  actionStatusId!: number[];

  outstandingCases$!:  Observable<OutstandingCase2[]>;
  recievedVehicleList$!:  Observable<OutstandingCase2[]>;

  loaded = false;

  constructor( 
    private outstandingCase2Service: OutstandingCase2Service,
    private dialog: MatDialog,) { }

  ngOnInit(): void {
   
    this.vehicleId$ = this.outstandingCase2Service.getVehicleId().pipe(skip(1)); 

    this.actionStatusId = [2,3,4,5];
    this.recievedVehicleList$ = this.outstandingCase2Service.getOutstandingCasesByVehicleId(null);
    this.recievedVehicleList$.subscribe(cases =>  this.loaded = cases.length > 0 ? true : false)
    
  }

  getOutstandingCasesByVehicleId(vehicleId: number){
    console.log(this.outstandingCase2Service.outstandingCases$.value.filter(outstandingCase => outstandingCase.assignedVehicleId === vehicleId));
    return this.outstandingCase2Service.outstandingCases$.value.filter(outstandingCase => outstandingCase.assignedVehicleId === vehicleId);
    
  }

  getOutstandingCasesByStatusId(vehicleId:number, statusId: number){
    
    return this.getOutstandingCasesByVehicleId(vehicleId).filter(outStandingCases => outStandingCases.actionStatusId === statusId);
    
  }

  getActionStatus(statusId:number){

    switch(statusId){
      case 1: 
        return 'Received' ; 
      case 2: 
        return 'Assigned'; 
      case 3:   
        return 'Arrived/Picked'; 
      case 4: 
        return 'Rescued/Released'; 
      case 5: 
        return 'Admitted';
      default:
        return '';
    }
    
  }

  drop(event: CdkDragDrop<any>) {
    console.log(event.previousContainer);
    console.log(event.container);
    if (event.previousContainer === event.container) {

      try{
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      }
      catch(error){
        console.log(error);
      }
    } else {

      try{

        // We need to move the item first when moving by drag so that the rescue
        // waits in its new swimlane until it either succeeds or fails and is moved back
        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);
      }
      catch(error){
        console.log(error);
      }
    }
  }

  openMediaDialog(patientId: number, tagNumber: string | null): void{
    this.dialog.open(MediaDialogComponent, {
        minWidth: '50%',
        data: {
            tagNumber,
            patientId,
        }
    });

  }
  
}
