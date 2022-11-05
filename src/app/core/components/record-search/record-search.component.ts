import { Component, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { CaseService } from 'src/app/modules/emergency-register/services/case.service';
import { MatDialog } from '@angular/material/dialog';
import { SearchResponse } from '../../models/responses';
import { Observable, Subject } from 'rxjs';
import { map, skip, takeUntil } from 'rxjs/operators';
import { UserOptionsService } from '../../services/user-option/user-options.service';
import { UserPreferences } from '../../models/user';

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

    loading = false;

    noResults = false;

    @Input() source = "";

    searchResultArray!: SearchResponse[];

    searchResults$!:Observable<SearchResponse[]>;

    constructor(
        public dialog: MatDialog,
        public rescueDialog: MatDialog,
        private userOptions: UserOptionsService,
        public callDialog: MatDialog,
        private caseService: CaseService
    ) {}

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    onSearchQuery(searchQuery:string) : void {
        this.loading = true;
        this.noResults = false;

        this.searchResults$ = this.caseService.searchCases(searchQuery);

        this.searchResults$
        .pipe(takeUntil(this.ngUnsubscribe), skip(1))
        .subscribe((value:SearchResponse[]) => {

            if(!value){
                this.noResults = true;
            }

            this.searchResultArray = value?.sort((date1: any,date2:any)=> {
                return new Date(date2.CallDateTime).valueOf() - new Date(date1.CallDateTime).valueOf();
            });
            this.loading = false;

        });

    }

    openCase(searchResult: SearchResponse) : void {

        this.userOptions.getUserPreferences().pipe(takeUntil(this.ngUnsubscribe),
        map((prefs: UserPreferences) => {

            if(prefs.clearSearchOnTabReturn){
                this.searchResultArray = [];
            }


        }))


        this.caseService.openCase({tab: searchResult, source: this.source});
    }
}
