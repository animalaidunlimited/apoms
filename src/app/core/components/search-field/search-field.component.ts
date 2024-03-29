import { map, skip } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { FormControl, FormGroup, FormArray, UntypedFormBuilder, Validators, AbstractControl, UntypedFormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NavigationService } from '../../../../../navigation/navigation.service';
import { Search } from '../record-search/record-search.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { MatSelectChange } from '@angular/material/select';
import { DropdownService } from '../../services/dropdown/dropdown.service';
import { CrossFieldErrorMatcher } from '../../validators/cross-field-error-matcher';
import { CaseService } from 'src/app/modules/emergency-register/services/case.service';

export interface SearchValue {
    id: number;
    inputType: string;
    searchValue: string | undefined;
    databaseField: string | undefined;
    dropdownName?: string;
    name: string | undefined;
    inNotIn: boolean;
}

@Component({
    selector: 'app-search-field',
    templateUrl: './search-field.component.html',
    styleUrls: ['./search-field.component.scss'],
    animations: [
        trigger('expandSearchForm', [
            state(
                'void',
                style({
                    display: 'none',
                    height: '0px',
                }),
            ),
            state(
                'open',
                style({
                    width: '97%',
                }),
            ),
            state(
                'closed',
                style({
                    display: 'none',
                    height: '0px',
                }),
            ),
            transition('open <=> closed', [animate('.2s')]),
        ])
    ]
})
export class SearchFieldComponent implements OnInit, OnDestroy {

    private ngUnsubscribe = new Subject();

    @Output() public searchString = new EventEmitter<string>();
    @ViewChild('searchBox') searchBox!:ElementRef;

    searchHistory: string[][] = [];
    historyShowing = false;

    search = new Search();

    searchFieldForm = new FormControl();

    searchForm: FormGroup = new FormGroup({});
    searchRows: FormArray = new UntypedFormArray([]);

    errorMatcher = new CrossFieldErrorMatcher();

    searchShowing = false;

    options: SearchValue[] = [
        {
            id: 0,
            inputType: 'text',
            searchValue: undefined,
            databaseField: undefined,
            name: undefined,
            inNotIn: false
        },
        {
            id: 1,
            inputType: 'number',
            searchValue: 'emno',
            databaseField: 'ec.EmergencyNumber',
            name: 'Em. no.',
            inNotIn: false
        },
        {
            id: 2,
            inputType: 'date',
            searchValue: 'calldate',
            databaseField: 'CAST(ec.CallDateTime AS DATE)',
            name: 'Call Date',
            inNotIn: false
        },
        {
            id: 3,
            inputType: 'text',
            searchValue: 'tagno',
            databaseField: 'p.TagNumber',
            name: 'Tag no.',
            inNotIn: false
        },
        {
            id: 4,
            inputType: 'text',
            searchValue: 'cname',
            databaseField: 'ec.EmergencyCaseId IN (SELECT DISTINCT ec.EmergencyCaseId FROM Caller c ' +
                'INNER JOIN AAU.EmergencyCaller ecr ON ecr.CallerId ~~ c.CallerId ' +
                'INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId ~~ ecr.EmergencyCaseId ' +
                'WHERE ecr.IsDeleted ~~ 0 AND c.Name =',
            name: 'Caller name',
            inNotIn: true
        },
        {
            id: 5,
            inputType: 'number',
            searchValue: 'cnumber',
            databaseField: 'ec.EmergencyCaseId IN (SELECT DISTINCT ec.EmergencyCaseId FROM Caller c ' +
                'INNER JOIN AAU.EmergencyCaller ecr ON ecr.CallerId ~~ c.CallerId ' +
                'INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId ~~ ecr.EmergencyCaseId ' +
                'WHERE ecr.IsDeleted ~~ 0 AND c.Number =',
            name: 'Caller no.',
            inNotIn: true
        },
        {
            id: 6,
            inputType: 'text',
            searchValue: 'location',
            databaseField: 'ec.Location',
            name: 'Location',
            inNotIn: false
        },
        {
            id: 8,
            inputType: 'dropdown',
            searchValue: 'species',
            databaseField: 'p.AnimalTypeId',
            dropdownName: 'animaltype',
            name: 'Animal type',
            inNotIn: false
        },
        {
            id: 9,
            inputType: 'dropdown',
            searchValue: 'problem',
            databaseField: 'pp.ProblemId',
            dropdownName: 'problem',
            name: 'Problem',
            inNotIn: false
        },
        {
            id: 10,
            inputType: 'dropdown',
            searchValue: 'outcome',
            databaseField: 'p.PatientCallOutcomeId',
            dropdownName: 'callOutcome',
            name: 'Patient call outcome',
            inNotIn: false
        },
        {
            id: 11,
            inputType: 'dropdown',
            searchValue: 'cloc',
            databaseField: 'search.TreatmentAreaId',
            dropdownName: 'treatmentArea',
            name: 'Treatment area',
            inNotIn: false
        },
        {
            id: 12,
            inputType: 'date',
            searchValue: 'releasedate',
            databaseField: 'p.PatientStatusId ~~ 2 AND CAST(p.PatientStatusDate AS DATE)',
            name: 'Release date',
            inNotIn: false
        },
        {
            id: 13,
            inputType: 'date',
            searchValue: 'dieddate',
            databaseField: 'p.PatientStatusId ~~ 3 AND CAST(p.PatientStatusDate AS DATE)',
            name: 'Died date',
            inNotIn: false
        },
        {
            id: 14,
            inputType: 'dropdown',
            searchValue: 'tycall',
            databaseField: 'p.PatientId IN (SELECT PatientId FROM AAU.PatientCall WHERE CallTypeId~~1)',
            dropdownName: 'tycall',
            name: 'Thanked',
            inNotIn: true
        },
        {
            id: 15,
            inputType: 'text',
            searchValue: 'aka',
            databaseField: 'p.KnownAsName',
            name: 'Known as',
            inNotIn: false
        }
    ];

    @HostListener('document:keydown.enter', ['$event'])
    executeSearchByEnter(event: KeyboardEvent) {
        event.preventDefault();
        this.executeSearch();
    }

    constructor(
        public rescueDialog: MatDialog,
        public callDialog: MatDialog,
        private formBuilder: UntypedFormBuilder,
        private navigationService: NavigationService,
        public platform: Platform,
        private datepipe: DatePipe,
        private caseService: CaseService,
        private dropdowns: DropdownService) { }

    ngOnInit(): void {

        this.navigationService.isSearchClicked.pipe(takeUntil(this.ngUnsubscribe)).subscribe((clicked) => {
            if (clicked && this.searchBox) {
                this.searchBox.nativeElement.focus();
            }
        });
        this.searchForm = this.formBuilder.group({
            searchRows: this.formBuilder.array([])
        });

    this.navigationService.isSearchClicked
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((clicked)=> {
            if(clicked && this.searchBox){
                    this.searchBox.nativeElement.focus();
            }
        });

        this.searchRows = this.searchForm.get('searchRows') as FormArray;

        this.caseService.clearResults$
            .pipe(takeUntil(this.ngUnsubscribe),
            skip(1))
            .subscribe(_ => this.search.searchString = '');

    }
    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    createItem(field: any, term: any, type: string | undefined, observable: Observable<any>): FormGroup {
        return this.formBuilder.group({
            searchField: [field, Validators.required],
            searchTerm: [term, Validators.required],
            inputType: [type],
            dropdownObservable: [observable]
        });
    }

    displayFn(user?: SearchValue): string | undefined {
        return user ? user.name : undefined;
    }

    executeSearch() {
        if (this.searchShowing) {
            this.searchShowing = !this.searchShowing;
            this.search.searchString = this.getSearchString();
        } else {
            this.updateSearchArray();
        }

        this.historyShowing = false;

        // If we're on a mobile device, hide the keyboard after searching.
        if (document.activeElement instanceof HTMLElement && (this.platform.ANDROID || this.platform.IOS)) {
            document.activeElement.blur();
        }

        const searchArray = this.getSearchArray();

        if (searchArray.length === 1) {
            if (searchArray[0].split(':')[1] === '' && this.search.searchString === '') {
                return;
            }
        }

        this.addRecordToHistory(searchArray);

        this.processSearchQueriesAndExecute(searchArray);
    }

    private processSearchQueriesAndExecute(searchArray: string[]) {
        const searchQueries = searchArray
            .map(async (item) => {

                const splitItem = item.split(':');

                const option = this.options.find(optionVal => optionVal.searchValue === splitItem[0].toLowerCase());

                // If we're dealing with an IN/NOT IN query, then change the IN/NOT IN depending on
                // what the user has entered into the Search Term field
                if (option?.inNotIn) {

                    option.databaseField = option.databaseField?.replace(' NOT IN (', ' IN (');

                    if (encodeURIComponent(splitItem[1].trim()).toLowerCase() === 'no') {

                        option.databaseField = option.databaseField?.replace(' IN (', ' NOT IN (');
                    }

                    return option?.databaseField + (option?.searchValue === 'tycall' ? '' : encodeURIComponent(splitItem[1].trim()));

                }
                else if (option?.dropdownName) {

                    return await this.observableFactory(option?.dropdownName).pipe(
                        map((dropdowns: any) => dropdowns.map((dropdown: any) => ({
                            id: Object.values(dropdown)[0],
                            value: Object.values(dropdown)[1]
                        })
                        )),
                        // eslint-disable-next-line max-len
                        map(dropdowns => dropdowns.filter((dropdown: any) => decodeURIComponent(dropdown.value).toLowerCase() === decodeURIComponent(splitItem[1].trim()).toLowerCase())[0]),
                        map(dropdown => dropdown ? dropdown.id : undefined)
                    ).toPromise().then((id) => {
                        return option?.databaseField + '=' + id;
                    });
                }
                else {

                    return option?.databaseField + '=' + encodeURIComponent(splitItem[1].trim());
                }
            });

        Promise.all(searchQueries).then((searchQuery) => {
            this.searchString.emit(searchQuery.join('&'));
        });
    }

    addRecordToHistory(search: string[]) : void {
        let found = this.searchHistory.find(element => JSON.stringify(element) === JSON.stringify(search));


        if(!found){
            this.searchHistory.push(search);
        }

        if(this.searchHistory.length > 10){
            this.searchHistory.shift();
        }

    }

    toggleHistoryBox() : void {

        this.searchShowing = false;
        this.historyShowing = !this.historyShowing;
    }

    loadHistorySearchItem(searchItem: string[]){
        this.toggleHistoryBox();
        this.processSearchQueriesAndExecute(searchItem);
        this.search.searchString = searchItem.join(',');
    }

    toggleSearchBox() : void {

        this.historyShowing = false;

        if (this.searchShowing) {
            this.search.searchString = this.getSearchString();
        } else {
            this.updateSearchArray();
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            this.searchRows.length === 0 ? this.addRow() : null;

        }
        this.searchShowing = !this.searchShowing;
    }

    updateSearchArray() {
        // If the field is empty we don't need to do anything.
        if (!this.search.searchString) {
            return;
        }

        const searchArray = this.getSearchArray();

        // Get the array of form elements and clear it out. We'll rebuild it from the search text box
        this.searchRows = this.searchForm.get('searchRows') as FormArray;
        this.searchRows.clear();

        // Rebuild the search array form the search field
        searchArray.forEach(item => {

            const splitItem = item.split(':');

            const option = this.options.find(
                optionVal => optionVal.searchValue === splitItem[0].toLowerCase(),
            );

            let searchTerm: string | null = splitItem[1].trim();
            if (this.isDate(searchTerm) && option?.inputType === 'date') {
                searchTerm = this.datepipe.transform(this.isDate(searchTerm), 'yyyy-MM-dd');
            }

            const dropdownType = option?.dropdownName;
            this.searchRows.push(
                this.createItem(option?.id, searchTerm, option?.inputType, this.observableFactoryPiped(dropdownType)),
            );
        });
    }

    clearSearch(){
        this.search.searchString='';
        this.searchShowing = false;
        this.searchString.emit(undefined);
    }


    isDate(dateStr: string) {
        if (dateStr === '' || dateStr.toString().length < 9 || dateStr.toString().length > 11 || dateStr.indexOf('-') < -1 || dateStr.indexOf('/') < -1) {
            return 0;
        }
        const splitChar = (dateStr.indexOf('-') > -1) ? '-' : '/';
        const dateParts = dateStr.split(splitChar);

        if (dateParts.length < 2) {
            return 0;
        }
        const year = dateParts.filter(datePart => datePart.length === 4)[0];
        let newDate;

        newDate = new Date(`${year}-${dateParts[1]}-${dateParts[0]}`);
        if (newDate.toString() === 'Invalid Date') {
            newDate = new Date(`${year}-${dateParts[1]}-${dateParts[2]}`);
        }

        return newDate.getMonth() + 1 ? newDate : 0;
    }

    getSearchArray() {

        // Filter out any empty values and then create a regex string which uses
        // the searchValue from the options array as a delimiter. This way we get a nice list
        // of all the search fields
        const regex = this.options
            .filter(option => option.searchValue != null)
            .map(item => {
                return '(?=' + item.searchValue + ':)';
            })
            .join('|');


        const delimiter = new RegExp(regex);

        const firstChar = this.search.searchString.toLowerCase().charAt(0);
        const searchString = this.search.searchString;

        let toSplit = this.search.searchString;

        //Check if the search string contains a colon
        if (searchString.indexOf(':') == -1) {

        //if (searchString.toLowerCase().search(delimiter) !== 0) {

            if (searchString.length < 8) {

                if (parseInt(firstChar, 10) <= 9 && parseInt(firstChar, 10) >= 0 && /^\d+$/.test(searchString)) {

                    toSplit = 'emno:' + searchString;

                }
                else if ((searchString.trim().split(' ').length - 1) === 0) {

                    toSplit = 'tagno:' + searchString;

                }

            }
            else if (searchString.length > 8 && searchString.length < 11) {
                if (searchString.indexOf('/') > -1 || searchString.indexOf('-') > -1 && this.isDate(searchString)) {

                    toSplit = 'calldate:' + searchString;

                } else if (/^\d+$/.test(searchString)) {

                    toSplit = 'cnumber:' + searchString;
                }
            }
            else {

                toSplit = 'location:' + searchString;

            }
        }

        return toSplit.split(delimiter);
    }

    getSearchString() {
        // Get the search array
        const searchArray = this.searchForm.get('searchRows') as FormArray;

        // Create a nice string of all of the values for the user to look at
        const searchText = searchArray.controls
            .map(item => {

                const option = this.options.find(currentOption => currentOption.id === item.value.searchField);

                if (item.value.searchTerm instanceof Object) {
                    return option?.searchValue + ':' + item.value.searchTerm.value;
                }

                if (this.isDate(item.value.searchTerm)) {
                    const date = this.datepipe.transform(new Date(item.value.searchTerm), 'dd/MM/yyyy');
                    return option?.searchValue + ':' + date;
                }

                return option?.searchValue ? option.searchValue + ':' + item.value.searchTerm : '';

            })
            .join(' ');


        // Put the formatted string back into the text box.
        return searchText;
    }

    addRow() {

        this.searchRows.push(this.createItem('', '', '', of()));
    }

    removeRow(i: any) {

        this.searchRows.removeAt(i);
    }

    optionSelection($event: MatSelectChange, item: AbstractControl) {

        const optionsIndex = this.options.findIndex(option => option.id === $event.value);

        if (optionsIndex !== 0) {

            const inputType = this.options[optionsIndex].inputType;

            item.get('inputType')?.setValue(inputType);

            item.get('dropdownObservable')?.setValue(this.observableFactoryPiped(this.options[optionsIndex].dropdownName));

        }

    }

    observableFactoryPiped(dropdownType: string | undefined) {

        return this.observableFactory(dropdownType).pipe(
            map((dropdowns: any) =>
                dropdowns.map((dropdown: any) =>
                    ({
                        id: Object.values(dropdown)[0],
                        value: Object.values(dropdown)[1]
                    })
                ))
        );
    }

    observableFactory(dropdownType: string | undefined) {

        if (dropdownType) {

            // a Switch statement that looks at the dropdown parameter and returns the correct observable
            switch (dropdownType) {

                case 'callOutcome':
                    return this.dropdowns.getCallOutcomes();

                case 'tycall':
                    return this.dropdowns.getYesNo();

                case 'problem':
                    return this.dropdowns.getProblems();

                case 'treatmentArea':
                    return this.dropdowns.getTreatmentAreas().pipe(map(areas =>
                        areas.map(area => ({
                            id: area.areaId,
                            value: area.areaName
                        }))
                    ));

                default:
                    return this.dropdowns.getAnimalTypes();
            }
        }
        return of();
    }
}
