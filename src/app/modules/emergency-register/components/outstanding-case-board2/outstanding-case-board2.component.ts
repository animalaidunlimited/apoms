import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { skip } from 'rxjs/operators';
import { MediaDialogComponent } from 'src/app/core/components/media/media-dialog/media-dialog.component';
import { Vehicle } from 'src/app/core/models/driver-view';
import { OutstandingCase2 } from 'src/app/core/models/outstanding-case';
import { LocationService } from 'src/app/core/services/location/location.service';
import { DriverViewService } from 'src/app/modules/driver-view/services/driver-view.service';

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
  vehcileList:Vehicle[] = [];
  loaded = false;

  constructor( 
    private outstandingCase2Service: OutstandingCase2Service,
    private dialog: MatDialog,
    private driverViewService: DriverViewService,
    private locationService: LocationService) { }

  ngOnInit(): void {
   
    this.vehicleId$ = this.outstandingCase2Service.getVehicleId().pipe(skip(1)); 

    this.actionStatusId = [2,3,4,5];
    this.recievedVehicleList$ = this.outstandingCase2Service.getOutstandingCasesByVehicleId(null);
    this.recievedVehicleList$.subscribe(cases =>  this.loaded = cases.length > 0 ? true : false);


    this.driverViewService.getVehicleListTableData().then((vehicleListTabledata:Vehicle[]) => {

      this.vehcileList = vehicleListTabledata;

    });

    
  }

 

  getOutstandingCasesByVehicleId(vehicleId: number){

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


  openMediaDialog(patientId: number, tagNumber: string | null): void{
    this.dialog.open(MediaDialogComponent, {
        minWidth: '50%',
        data: {
            tagNumber,
            patientId,
        }
    });

  }


  getVehcileDetails(vehicleId: number){
    
    return this.locationService.getVehicleVehicleLocation(vehicleId);
  }

  
  
}
