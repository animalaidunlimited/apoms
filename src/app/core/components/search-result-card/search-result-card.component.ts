import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SearchResponse } from '../../models/responses';
import { MatDialog } from '@angular/material/dialog';
import { PatientEditDialog } from '../patient-edit/patient-edit.component';
import { RescueDetailsDialogComponent } from '../rescue-details-dialog/rescue-details-dialog.component';
import { PatientCallDialogComponent } from 'src/app/modules/hospital-manager/components/patient-call-dialog/patient-call-dialog.component';
import { SurgeryRecordDialogComponent } from 'src/app/modules/hospital-manager/components/surgery-record-dialog/surgery-record-dialog/surgery-record-dialog.component';
import { EmergencyTab } from '../../models/emergency-record';

@Component({
  selector: 'search-result-card',
  templateUrl: './search-result-card.component.html',
  styleUrls: ['./search-result-card.component.scss']
})
export class SearchResultCardComponent implements OnInit {

  @Input() record:SearchResponse;
  @Output() public onOpenEmergencyCase = new EventEmitter<EmergencyTab>();

  constructor(
        public dialog: MatDialog,
        public rescueDialog: MatDialog,
        public callDialog: MatDialog,
  ) { }

  ngOnInit(): void {}

  openCase(caseSearchResult: SearchResponse) {

    this.onOpenEmergencyCase.emit(caseSearchResult);
}

quickUpdate(patientId: number, tagNumber: string) {
  this.dialog.open(PatientEditDialog, {
      width: '500px',
      data: { patientId, tagNumber },
  });
}

rescueUpdate(emergencyCaseId: number,  callDateTime: Date | string,  CallOutcomeId: number, CallOutcome: string,  sameAsNumber: number) {

  this.rescueDialog.open(RescueDetailsDialogComponent, {
      width: '500px',
      data: {
          emergencyCaseId,
          callDateTime,
          CallOutcomeId,
          CallOutcome,
          sameAsNumber
      }
  });
}

callUpdate(patientId: number, tagNumber: string) {
  this.callDialog.open(PatientCallDialogComponent, {
      width: '500px',
      data: { patientId, tagNumber },
  });
}

openSurgeryDialog(
  patientId: number,
  tagNumber: string,
  emergencyNumber: number,
  animalType: string,
) {
  const dialogRef = this.dialog.open(SurgeryRecordDialogComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      data: {
          patientId,
          tagNumber,
          emergencyNumber,
          animalType,
      },
  });
  dialogRef.afterClosed().subscribe(result => {

  });
}

addSurgery(patientId, tagNumber, emergencyNumber, animalType) {
  this.openSurgeryDialog(
      patientId,
      tagNumber,
      emergencyNumber,
      animalType,
  );
}


}
