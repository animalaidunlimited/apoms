import { Component, OnInit } from '@angular/core';

export interface CensusRecord {
    date: string;
    area: string;
    action: string;
}

const ELEMENT_DATA: CensusRecord[] = [{ date: '', area: '', action: '' }];

@Component({
    selector: 'census-details',
    templateUrl: './census-details.component.html',
    styleUrls: ['./census-details.component.scss'],
})
export class CensusDetailsComponent implements OnInit {
    constructor() {}

    displayedColumns: string[] = ['Date', 'Area', 'Action'];
    censusRecords = ELEMENT_DATA;

    ngOnInit() {}
}
