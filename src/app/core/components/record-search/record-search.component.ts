import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CaseService } from 'src/app/modules/emergency-register/services/case.service';
import { MatDialog } from '@angular/material/dialog';
import { SearchResponse } from '../../models/responses';
import { Observable, Subscription } from 'rxjs';
import { SnackbarService } from '../../services/snackbar/snackbar.service';

export interface SearchValue {
    id: number;
    inputType: string;
    searchValue: string | undefined;
    databaseField: string | undefined;
    dropdownName?: string;
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

    searchResultArray!: SearchResponse[];

    searchResults$!:Observable<SearchResponse[]>;
 
    constructor(
        public dialog: MatDialog,
        public rescueDialog: MatDialog,
        public callDialog: MatDialog,
        private caseService: CaseService,
        private showSnackBar: SnackbarService
    ) {}

    onSearchQuery(searchQuery:string){
        this.loading = true;
        this.searchResults$ = this.caseService.searchCases(searchQuery);

        this.searchResults$.subscribe((value)=>{
            this.searchResultArray = value.sort((date1: any,date2:any)=> {
                return new Date(date2.CallDateTime).valueOf() - new Date(date1.CallDateTime).valueOf();
            });
            this.loading = false;
        });
    
    }

    openCase(searchResult: SearchResponse) {
        this.openEmergencyCase.emit(searchResult);
    }
}
