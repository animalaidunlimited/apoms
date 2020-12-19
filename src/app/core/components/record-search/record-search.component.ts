import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CaseService } from 'src/app/modules/emergency-register/services/case.service';
import { MatDialog } from '@angular/material/dialog';
import { SearchResponse } from '../../models/responses';
import { Observable, Subscription } from 'rxjs';

export interface SearchValue {
    id: number;
    inputType: string;
    searchValue: string | undefined;
    databaseField: string | undefined;
    name: string | undefined;
    inNotIn: boolean;
}

export class Search {
    searchString = '';
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'record-search',
    templateUrl: './record-search.component.html',
    styleUrls: ['./record-search.component.scss']
})

export class RecordSearchComponent {

    @Output() public openEmergencyCase = new EventEmitter<SearchResponse>();

    loading = false;

    searchResults$!:Observable<SearchResponse[]>;

    constructor(
        public dialog: MatDialog,
        public rescueDialog: MatDialog,
        public callDialog: MatDialog,
        private caseService: CaseService,
    ) {}

    onSearchQuery(searchQuery:string){
        this.loading = true;
        this.searchResults$ = this.caseService.searchCases(searchQuery);

        this.searchResults$.subscribe(()=>{
            this.loading = false;
        });
    
    }

    openCase(searchResult: SearchResponse) {

        this.openEmergencyCase.emit(searchResult);
    }
}
