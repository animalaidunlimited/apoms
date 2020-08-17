import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    FormArray,
    Validators,
} from '@angular/forms';
import {
    trigger,
    state,
    style,
    animate,
    transition,
} from '@angular/animations';
import { CaseService } from 'src/app/modules/emergency-register/services/case.service';
import { MatDialog } from '@angular/material/dialog';
import { SearchResponse } from '../../models/responses';
import { PatientEditDialog } from '../patient-edit/patient-edit.component';
import { RescueDetailsDialogComponent } from '../rescue-details-dialog/rescue-details-dialog.component';
import { PatientCallDialogComponent } from '../../../modules/hospital-manager/components/patient-call-dialog/patient-call-dialog.component';
import { AddSurgeryDialogComponent } from 'src/app/modules/hospital-manager/components/add-surgery-dialog/add-surgery-dialog.component';

export interface SearchValue {
    id: number;
    inputType: string;
    searchValue: string;
    databaseField: string;
    name: string;
}

export class Search {
    searchString: string;
}

@Component({
    selector: 'record-search',
    templateUrl: './record-search.component.html',
    styleUrls: ['./record-search.component.scss'],
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
        ]),
    ],
})
export class RecordSearchComponent implements OnInit {
    @Input() parentName: string;
    @Output() public onOpenEmergencyCase = new EventEmitter<any>();

    searchFieldForm = new FormControl();

    searchForm: FormGroup;
    searchRows: FormArray;

    searchShowing = false;

    search = new Search();

    options: SearchValue[] = [
        {
            id: 0,
            inputType: 'text',
            searchValue: null,
            databaseField: null,
            name: null,
        },
        {
            id: 1,
            inputType: 'text',
            searchValue: 'emno',
            databaseField: 'ec.EmergencyNumber',
            name: 'Em. No.',
        },
        {
            id: 2,
            inputType: 'date',
            searchValue: 'date',
            databaseField: 'CAST(ec.CallDateTime AS DATE)',
            name: 'Date',
        },
        {
            id: 3,
            inputType: 'text',
            searchValue: 'tagno',
            databaseField: 'p.TagNumber',
            name: 'Tag No.',
        },
        {
            id: 4,
            inputType: 'text',
            searchValue: 'cname',
            databaseField: 'c.Name',
            name: 'Caller Name',
        },
        {
            id: 5,
            inputType: 'text',
            searchValue: 'cnumber',
            databaseField: 'c.Number',
            name: 'Caller No.',
        },
        {
            id: 6,
            inputType: 'text',
            searchValue: 'location',
            databaseField: 'ec.Location',
            name: 'Location',
        },
        {
            id: 7,
            inputType: 'text',
            searchValue: 'area',
            databaseField: '',
            name: 'Area',
        },
        {
            id: 8,
            inputType: 'text',
            searchValue: 'species',
            databaseField: 'at.AnimalType',
            name: 'Animal Type',
        },
        {
            id: 9,
            inputType: 'text',
            searchValue: 'problem',
            databaseField: 'pp.Problem',
            name: 'Problem',
        },
        {
            id: 10,
            inputType: 'text',
            searchValue: 'outcome',
            databaseField: 'o.Outcome',
            name: 'Result',
        },
        {
            id: 11,
            inputType: 'text',
            searchValue: 'cloc',
            databaseField: '',
            name: 'Current Location',
        },
        {
            id: 12,
            inputType: 'date',
            searchValue: 'releasedate',
            databaseField: 'CAST(p.ReleaseDate AS DATE)',
            name: 'Release Date',
        },
        {
            id: 13,
            inputType: 'date',
            searchValue: 'dieddate',
            databaseField: 'CAST(p.DiedDate AS DATE)',
            name: 'Died Date',
        },
    ];

    constructor(
        public dialog: MatDialog,
        public rescueDialog: MatDialog,
        public callDialog: MatDialog,
        private formBuilder: FormBuilder,
        private caseService: CaseService,
    ) {}

    searchResults$;

    ngOnInit() {
        this.searchForm = this.formBuilder.group({
            searchRows: this.formBuilder.array([]),
        });

        this.searchShowing = false;
    }

    createItem(field: any, term: any): FormGroup {
        return this.formBuilder.group({
            searchField: [field, Validators.required],
            searchTerm: [term, Validators.required],
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

        const searchArray = this.getSearchArray();

        const searchQuery = searchArray
            .map(item => {
                const splitItem = item.split(':');

                const option = this.options.find(
                    option => option.searchValue == splitItem[0].toLowerCase(),
                );

                return (
                    option.databaseField +
                    '=' +
                    encodeURIComponent(splitItem[1].trim())
                );
            })
            .join('&');

        this.searchResults$ = this.caseService.searchCases(searchQuery);
    }

    toggleSearchBox() {
        if (this.searchShowing) {
            this.search.searchString = this.getSearchString();
        } else {
            this.updateSearchArray();
        }

        this.searchShowing = !this.searchShowing;
    }

    updateSearchArray() {
        // If the field is empty we don't need to do anything.
        if (!this.search.searchString) {
            return;
        }

        const searchArray = this.getSearchArray();

        // Get the array of form elements and clear it out. We'll rebuild it from the
        // search text box
        this.searchRows = this.searchForm.get('searchRows') as FormArray;
        this.searchRows.clear();

        // Rebuild the search array form the search field
        searchArray.forEach(item => {
            const splitItem = item.split(':');

            const option = this.options.find(
                option => option.searchValue == splitItem[0].toLowerCase(),
            );

            this.searchRows.push(
                this.createItem(option.id, splitItem[1].trim()),
            );
        });
    }

    getSearchArray() {
        // Filter out any empty values and then create a regex string which uses
        // the searchValue from the options array as a delimiter. This way we get a nice list
        // of all the search fields
        const regex = this.options
            .filter(option => option.searchValue != null)
            .map(item => {
                return '(?=' + item.searchValue + ')';
            })
            .join('|');

        const delimiter = new RegExp(regex);

        const toSplit =
            (this.search.searchString.toLowerCase().search(delimiter) != 0
                ? 'tagno:'
                : '') + this.search.searchString;

        return toSplit.split(delimiter);
    }

    getSearchString() {
        // Get the search array
        const searchArray = this.searchForm.get('searchRows') as FormArray;

        // Create a nice string of all of the values for the user to look at
        const searchText = searchArray.controls
            .map(item => {
                const option = this.options.find(
                    option => option.id == item.value.searchField,
                );

                return option.searchValue + ':' + item.value.searchTerm;
            })
            .join(' ');

        // Put the formatted string back into the text box.
        return searchText;
    }

    addRow() {
        this.searchRows = this.searchForm.get('searchRows') as FormArray;
        this.searchRows.push(this.createItem('', ''));
    }

    removeRow(i) {
        this.searchRows.removeAt(i);
    }

    openCase(caseSearchResult: SearchResponse) {
        this.onOpenEmergencyCase.emit({ caseSearchResult });
    }

    loadHospitalRecord(emergencyCaseId, emergencyNumber) {
        alert('Open the hospital manager record');
    }

    quickUpdate(patientId: number, tagNumber: string) {
        this.dialog.open(PatientEditDialog, {
            width: '500px',
            data: { patientId, tagNumber },
        });
    }

    rescueUpdate(
        emergencyCaseId: number,
        callDateTime: Date | string,
        callOutcome: number,
    ) {
        this.rescueDialog.open(RescueDetailsDialogComponent, {
            width: '500px',
            data: {
                emergencyCaseId,
                callDateTime,
                callOutcome,
            },
        });
    }

    callUpdate(patientId: number, tagNumber: string) {
        this.callDialog.open(PatientCallDialogComponent, {
            width: '500px',
            data: { patientId, tagNumber },
        });
    }

    openSurgeryDialog(
        patientId: number,
        tagNumber: string,
        emergencyNumber: number,
        animalType: string,
    ) {
        const dialogRef = this.dialog.open(AddSurgeryDialogComponent, {
            maxWidth: '100vw',
            maxHeight: '100vh',
            width: '90%',
            height: '70%',
            data: {
                patientId,
                tagNumber,
                emergencyNumber,
                animalType,
            },
        });
        dialogRef.afterClosed().subscribe(result => {});
    }

    addSurgery(patientId, tagNumber, emergencyNumber, animalType) {
        this.openSurgeryDialog(
            patientId,
            tagNumber,
            emergencyNumber,
            animalType,
        );
    }
}
