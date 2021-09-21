import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MediaDialogComponent } from 'src/app/core/components/media/media-dialog/media-dialog.component';
import { ReleaseAssignDialogComponent } from 'src/app/core/components/release-assign-dialog/release-assign-dialog.component';
import { RescueDetailsDialogComponent } from 'src/app/core/components/rescue-details-dialog/rescue-details-dialog.component';
import { convertAssignmentToSearchResponse } from 'src/app/core/helpers/utils';
import { DriverAssignment } from 'src/app/core/models/driver-view';
import { OutstandingAssignment } from 'src/app/core/models/outstanding-case';
import { CaseService } from '../../services/case.service';
@Component({
    selector: 'app-outstanding-case-board-case-panel',
    templateUrl: './outstanding-case-board-case-panel.component.html',
    styleUrls: ['./outstanding-case-board-case-panel.component.scss'],
    animations:
    [
      trigger('rescueMoved',
      [
        state('void', style({
          background: 'transparent'
        })),
        state('moved',style({
          background: 'lightsteelblue'

      })),
      state('still', style({
        background: 'transparent'
      })),
      transition('moved => still', [
        animate('1s')
      ]),
      transition('still => moved', [
        animate('0s')
      ])

    ])
  ]
})
export class OutstandingCaseBoardCasePanelComponent {

    @Input() outstandingCase!: OutstandingAssignment | DriverAssignment;

    constructor (
      public releaseAssignDialog: MatDialog,
      public rescueDialog: MatDialog,
      public dialog: MatDialog,
      public caseService: CaseService
      ) {}

    openRescueEdit(outstandingCase:OutstandingAssignment | DriverAssignment){
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

    openCase(caseSearchResult:OutstandingAssignment | DriverAssignment){

      const result = convertAssignmentToSearchResponse(caseSearchResult);

        this.caseService.openCase({tab: result, source: "emergencyRegister"});
    }

    openReleaseAssignDialog(caseDetails: OutstandingAssignment | DriverAssignment) {
        const dialogRef = this.releaseAssignDialog.open(ReleaseAssignDialogComponent, {
          maxWidth: '100vw',
          maxHeight: '100vh',
          data: {
            caseDetails
          }
        });
      }

}