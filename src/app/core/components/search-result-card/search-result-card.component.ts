import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SearchResponse } from '../../models/responses';
import { MatDialog } from '@angular/material/dialog';
import { PatientEditDialog } from '../patient-edit/patient-edit.component';
import { RescueDetailsDialogComponent } from '../rescue-details-dialog/rescue-details-dialog.component';
import { PatientCallDialogComponent } from 'src/app/modules/hospital-manager/components/patient-call-dialog/patient-call-dialog.component';
import { UserOptionsService } from '../../services/user-options.service';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { SurgeryRecordDialogComponent } from 'src/app/modules/hospital-manager/components/surgery-record-dialog/surgery-record-dialog/surgery-record-dialog.component';

@Component({
  selector: 'search-result-card',
  templateUrl: './search-result-card.component.html',
  styleUrls: ['./search-result-card.component.scss']
})
export class SearchResultCardComponent implements OnInit {

  @Input() record:SearchResponse;
  @Output() public openEmergencyCase = new EventEmitter<SearchResponse>();

  constructor(
        public dialog: MatDialog,
        public rescueDialog: MatDialog,
        public callDialog: MatDialog,
        private userOptions: UserOptionsService,
        private printService: PrintTemplateService
  ) {}

  ngOnInit(): void {}

  openCase(caseSearchResult: SearchResponse) {

    this.openEmergencyCase.emit(caseSearchResult);
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

printEmergencyCard(patientId: number){

  const printTemplateId = this.userOptions.getEmergencyCardTemplateId();

  this.printService.printPatientDocument(printTemplateId, patientId);

}


}
