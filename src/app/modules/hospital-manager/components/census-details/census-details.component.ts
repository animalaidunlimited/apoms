import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CensusService } from 'src/app/core/services/census/census.service';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';


export interface CensusRecord {
    date: string;
    area: string;
    action: string;
    days : number;
    order : number;
}

const ELEMENT_DATA: CensusRecord[] = [{ date: '', area: '', action: '', days: 0, order: 0}];

@Component({
    selector: 'census-details',
    templateUrl: './census-details.component.html',
    styleUrls: ['./census-details.component.scss'],
})
export class CensusDetailsComponent implements OnInit {

    constructor(private census : CensusService) {}

    @Input() tagNumber!: string;

    censusUpdatedate : Date | string = '';

    @ViewChild(MatTable) censusTable!: MatTable<any>;

    tagnumber = '';

    displayedColumns: string[] = ['Date', 'Area', 'Action','Days'];
    censusRecords = ELEMENT_DATA;

    ngOnInit() {
        this.census.getCensusByTag(this.tagNumber).then(response => {

            this.censusRecords = response;

            if(response){

               this.censusRecords.sort((record1, record2 ) => record1.order < record2.order ? -1 : 1);
            }

        });

    }

}
