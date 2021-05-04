import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { TreatmentListService } from 'src/app/modules/treatment-list/services/treatment-list.service';


export interface TreatmentAreaRecord {
    date: string;
    area: string;
    action: string;
    days : number;
    order : number;
}

const ELEMENT_DATA: TreatmentAreaRecord[] = [{ date: '', area: '', action: '', days: 0, order: 0}];

@Component({
    selector: 'treatment-area-history',
    templateUrl: './treatment-area-history.component.html',
    styleUrls: ['./treatment-area-history.component.scss'],
})
export class TreatmentAreaHistoryComponent implements OnInit {

    constructor(private treatmentList : TreatmentListService) {}

    @Input() tagNumber!: string;

    @ViewChild(MatTable) treatmentAreaHistoryTable!: MatTable<any>;

    tagnumber = '';

    displayedColumns: string[] = ['Date', 'Area', 'Action','Days'];
    treatmentAreaHistory = ELEMENT_DATA;

    ngOnInit() {
        this.treatmentList.getTreatmentAreaHistoryByTag(this.tagNumber).then(response => {

            this.treatmentAreaHistory = response;

            if(response){

               this.treatmentAreaHistory.sort((record1, record2 ) => record1.order < record2.order ? -1 : 1);
            }

        });

    }

}
