import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CaseService } from 'src/app/modules/emergency-register/services/case.service';
import { MatDialog } from '@angular/material/dialog';
import { SearchResponse } from '../../models/responses';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'record-search',
    templateUrl: './record-search.component.html',
    styleUrls: ['./record-search.component.scss']
})

export class RecordSearchComponent implements OnDestroy {

    private ngUnsubscribe = new Subject();

    @Output() public openEmergencyCase = new EventEmitter<SearchResponse>();

    loading = false;

    noResults = false;

    searchResultArray!: SearchResponse[];

    searchResults$!:Observable<SearchResponse[]>;

    constructor(
        public dialog: MatDialog,
        public rescueDialog: MatDialog,
        public callDialog: MatDialog,
        private caseService: CaseService
    ) {}

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    onSearchQuery(searchQuery:string){
        this.loading = true;
        this.noResults = false;

        this.searchResults$ = this.caseService.searchCases(searchQuery);

        this.searchResults$
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((value)=>{

            if(!value){
                this.noResults = true;
            }

            this.searchResultArray = value?.sort((date1: any,date2:any)=> {
                return new Date(date2.CallDateTime).valueOf() - new Date(date1.CallDateTime).valueOf();
            });
            this.loading = false;
        });

    }

    openCase(searchResult: SearchResponse) {
        this.openEmergencyCase.emit(searchResult);
    }
}
