
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { skip } from 'rxjs/operators';
import { MediaDialogComponent } from 'src/app/core/components/media/media-dialog/media-dialog.component';
import { RescueDetailsDialogComponent } from 'src/app/core/components/rescue-details-dialog/rescue-details-dialog.component';
import { OutstandingAssignment2 } from 'src/app/core/models/outstanding-case';
import { SearchResponse } from 'src/app/core/models/responses';

import { OutstandingCase2Service } from '../../services/outstanding-case2.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'outstanding-case-board2',
  templateUrl: './outstanding-case-board2.component.html',
  styleUrls: ['./outstanding-case-board2.component.scss']
})
export class OutstandingCaseBoard2Component implements OnInit {

  vehicleId$!: Observable<(number | null)[]>;

  @Output() public openEmergencyCase = new EventEmitter<SearchResponse>();

  outstandingCases$!:  Observable<OutstandingAssignment2[]>;
  receivedVehicleList$!:  Observable<OutstandingAssignment2[]>;

  loaded = false;

  constructor( 
    private outstandingCase2Service: OutstandingCase2Service,
    public rescueDialog: MatDialog,
    private dialog: MatDialog) { }

  ngOnInit(): void {

    this.vehicleId$ = this.outstandingCase2Service.getVehicleId().pipe(skip(1)); 
 
    this.receivedVehicleList$ = this.outstandingCase2Service.getOutstandingCasesByVehicleId(null);
    this.receivedVehicleList$.subscribe(cases =>  this.loaded = cases.length > 0 ? true : false);

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

  openCase(caseSearchResult:OutstandingAssignment2)
  {

    const result:SearchResponse = {

      EmergencyCaseId: caseSearchResult.emergencyCaseId,
      EmergencyNumber: caseSearchResult.emergencyNumber,
      CallDateTime: caseSearchResult.callDateTime.toString(),
      callerDetails: caseSearchResult.callerDetails,
      AnimalTypeId: 0,
      AnimalType: '',
      PatientId: 0,
      MediaCount: 0,
      TagNumber: '',
      CallOutcomeId: 0,
      CallOutcome: undefined,
      sameAsNumber: undefined,
      Location: caseSearchResult.location,
      Latitude: caseSearchResult.lat,
      Longitude: caseSearchResult.lng,
      CurrentLocation: undefined,

    };

    this.openEmergencyCase.emit(result);
  }

  
}
