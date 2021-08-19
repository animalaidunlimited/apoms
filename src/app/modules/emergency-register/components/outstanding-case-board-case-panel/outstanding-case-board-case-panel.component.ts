import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OutstandingAssignment } from 'src/app/core/models/outstanding-case';

@Component({
    selector: 'app-outstanding-case-board-case-panel',
    templateUrl: './outstanding-case-board-case-panel.component.html',
    styleUrls: ['./outstanding-case-board-case-panel.component.scss']
})
export class OutstandingCaseBoardCasePanelComponent {
    @Input() outstandingCase!: OutstandingAssignment;
    @Output() rescueEdit: EventEmitter<OutstandingAssignment> = new EventEmitter();
    @Output() mediaDialog: EventEmitter<{patientId: number, tagNumber: string | null}> = new EventEmitter();
    @Output() openCaseEmitter: EventEmitter<OutstandingAssignment> = new EventEmitter();
    constructor () {}
   

    openRescueEdit(outstandingCase:OutstandingAssignment){
        this.rescueEdit.emit(outstandingCase);
    }

    openCase(caseSearchResult:OutstandingAssignment){
      
        this.openCaseEmitter.emit(caseSearchResult);
    }

    openMediaDialog($event:{patientId: number, tagNumber: string | null}): void {
        this.mediaDialog.emit($event);
    } 
    
}