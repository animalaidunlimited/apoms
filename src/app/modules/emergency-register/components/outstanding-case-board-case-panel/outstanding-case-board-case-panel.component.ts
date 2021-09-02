import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReleaseAssignDialogComponent } from 'src/app/core/components/release-assign-dialog/release-assign-dialog.component';
import { OutstandingAssignment } from 'src/app/core/models/outstanding-case';
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
    @Input() outstandingCase!: OutstandingAssignment;
    @Output() rescueEdit: EventEmitter<OutstandingAssignment> = new EventEmitter();
    @Output() mediaDialog: EventEmitter<{patientId: number, tagNumber: string | null}> = new EventEmitter();
    @Output() openCaseEmitter: EventEmitter<OutstandingAssignment> = new EventEmitter();
    constructor (public releaseAssignDialog: MatDialog,) {}
   

    openRescueEdit(outstandingCase:OutstandingAssignment){
        this.rescueEdit.emit(outstandingCase);
    }

    openCase(caseSearchResult:OutstandingAssignment){
      
        this.openCaseEmitter.emit(caseSearchResult);
    }

    openMediaDialog($event:{patientId: number, tagNumber: string | null}): void {
        this.mediaDialog.emit($event);
    } 

    openReleaseAssignDialog(caseDetails: OutstandingAssignment) {
        const dialogRef = this.releaseAssignDialog.open(ReleaseAssignDialogComponent, {
          maxWidth: '100vw',
          maxHeight: '100vh',
          data: {
            caseDetails
          }
        });
      }
    
}