import { EmergencyCase } from './../../models/emergency-record';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SearchResponse } from '../../models/responses';
import { MatDialog } from '@angular/material/dialog';
import { PatientEditDialog } from '../patient-edit/patient-edit.component';
import { RescueDetailsDialogComponent } from '../rescue-details-dialog/rescue-details-dialog.component';
import { PatientCallDialogComponent } from 'src/app/modules/hospital-manager/components/patient-call-dialog/patient-call-dialog.component';
import { UserOptionsService } from '../../services/user-option/user-options.service';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { SurgeryRecordDialogComponent } from 'src/app/modules/hospital-manager/components/surgery-record-dialog/surgery-record-dialog.component';
import { ReleaseDetailsDialogComponent } from 'src/app/modules/hospital-manager/components/release-details-dialog/release-details-dialog.component';
import { MediaDialogComponent } from '../media-dialog/media-dialog.component';
import { CallerDetails } from '../../models/emergency-record';


@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'search-result-card',
  templateUrl: './search-result-card.component.html',
  styleUrls: ['./search-result-card.component.scss']
})
export class SearchResultCardComponent implements OnInit {

  @Input() record!:SearchResponse;
  @Output() public openEmergencyCase = new EventEmitter<SearchResponse>();

  callerObject!: CallerDetails[];
  constructor(
        public dialog: MatDialog,
        public rescueDialog: MatDialog,
        public callDialog: MatDialog,
        private userOptions: UserOptionsService,
        private printService: PrintTemplateService
  ) {}

  ngOnInit(): void {

    this.callerObject = this.record.callerDetails;

    this.printService.initialisePrintTemplates();
  }

  openCase(caseSearchResult: SearchResponse) {

    this.openEmergencyCase.emit(caseSearchResult);
  }

quickUpdate(patientId: number, tagNumber: string | undefined) {
  this.dialog.open(PatientEditDialog, {
      width: '500px',
      data: { patientId, tagNumber },
  });
}

rescueUpdate(emergencyCaseId: number,  callDateTime: Date | string,  CallOutcomeId: number | undefined, CallOutcome: string | undefined,  sameAsNumber: number | undefined) {

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

callUpdate(patientId: number, tagNumber: string | undefined) {
  this.callDialog.open(PatientCallDialogComponent, {
      width: '500px',
      data: { patientId, tagNumber },
  });
}

openSurgeryDialog(
  patientId: number,
  tagNumber: string | undefined,
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
  dialogRef.afterClosed().subscribe(() => {});
}

addSurgery(patientId:number, tagNumber:string, emergencyNumber:number, animalType:string) {
  this.openSurgeryDialog(
      patientId,
      tagNumber,
      emergencyNumber,
      animalType,
  );
}

openMediaDialog(patientId: number, tagNumber: string): void{
  const dialogRef = this.dialog.open(MediaDialogComponent, {
      minWidth: '50%',
      data: {
          tagNumber,
          patientId,
      }
  });

  dialogRef.afterClosed();
}

printEmergencyCard(patientId: number){

  const printTemplateId = this.userOptions.getEmergencyCardTemplateId();

  this.printService.printPatientDocument(printTemplateId, patientId);

}

openReleaseDialog(emergencyCaseId: number, tagNumber: string | undefined, patientId: number| undefined) {

  const dialogRef = this.dialog.open(ReleaseDetailsDialogComponent, {
    maxHeight: '100vh',
    maxWidth: '100vw',
    panelClass: 'full-width-dialog',
    data: {
      emergencyCaseId,
      tagNumber,
      patientId
    }
});

dialogRef.afterClosed().subscribe(() => {}).unsubscribe();


}


}
