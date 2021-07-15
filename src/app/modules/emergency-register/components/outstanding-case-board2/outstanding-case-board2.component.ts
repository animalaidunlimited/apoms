
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { skip } from 'rxjs/operators';
import { MediaDialogComponent } from 'src/app/core/components/media/media-dialog/media-dialog.component';
import { RescueDetailsDialogComponent } from 'src/app/core/components/rescue-details-dialog/rescue-details-dialog.component';
import { OutstandingAssignment2 } from 'src/app/core/models/outstanding-case';

import { OutstandingCase2Service } from '../../services/outstanding-case2.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'outstanding-case-board2',
  templateUrl: './outstanding-case-board2.component.html',
  styleUrls: ['./outstanding-case-board2.component.scss']
})
export class OutstandingCaseBoard2Component implements OnInit {

  vehicleId$!: Observable<(number | null)[]>;



  outstandingCases$!:  Observable<OutstandingAssignment2[]>;
  recievedVehicleList$!:  Observable<OutstandingAssignment2[]>;

  loaded = false;

  constructor( 
    private outstandingCase2Service: OutstandingCase2Service,
    public rescueDialog: MatDialog,
    private dialog: MatDialog) { }

  ngOnInit(): void {

    this.vehicleId$ = this.outstandingCase2Service.getVehicleId().pipe(skip(1)); 
 

    this.recievedVehicleList$ = this.outstandingCase2Service.getOutstandingCasesByVehicleId(null);
    this.recievedVehicleList$.subscribe(cases =>  this.loaded = cases.length > 0 ? true : false);

  }

  openRescueEdit(outstandingCase:OutstandingAssignment2){
    const rescueDialog = this.rescueDialog.open(RescueDetailsDialogComponent, {
        maxWidth: 'auto',
        maxHeight: '100vh',
        data: {
                emergencyCaseId:outstandingCase.emergencyCaseId,
                emergencyNumber:outstandingCase.emergencyNumber
            }
    });
  }

  openMediaDialog($event:{patientId: number, tagNumber: string | null}): void {
    const tagNumber = $event.tagNumber;
    const patientId = $event.patientId;
    this.dialog.open(MediaDialogComponent, {
        minWidth: '50%',
        data: {
            tagNumber,
            patientId,
        },
    });
  }

  
}
