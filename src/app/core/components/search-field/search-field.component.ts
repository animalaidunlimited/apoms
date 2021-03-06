import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { FormControl, FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NavigationService } from '../../services/navigation/navigation.service';
import { Search, SearchValue } from '../record-search/record-search.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    ]),
]
})
export class SearchFieldComponent implements OnInit, OnDestroy {

    private ngUnsubscribe = new Subject();

    @Output() public searchString = new EventEmitter<string>();
    @ViewChild('searchBox') searchBox!:ElementRef;

    search = new Search();

    searchFieldForm = new FormControl();

    searchForm: FormGroup = new FormGroup({});
    searchRows: FormArray = new FormArray([]);

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
            inputType: 'text',
            searchValue: 'emno',
            databaseField: 'search.EmergencyNumber',
            name: 'Em. no.',
            inNotIn: false
        },
        {
            id: 2,
            inputType: 'date',
            searchValue: 'calldate',
            databaseField: 'CAST(search.CallDateTime AS DATE)',
            name: 'Call Date',
            inNotIn: false
        },
        {
            id: 3,
            inputType: 'text',
            searchValue: 'tagno',
            databaseField: 'search.TagNumber',
            name: 'Tag no.',
            inNotIn: false
        },
        {
            id: 4,
            inputType: 'text',
            searchValue: 'cname',
            databaseField: 'search.EmergencyCaseId IN (SELECT DISTINCT ec.EmergencyCaseId FROM Caller c ' +
            'INNER JOIN AAU.EmergencyCaller ecr ON ecr.CallerId ~~ c.CallerId ' +
            'INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId ~~ ecr.EmergencyCaseId ' +
            'WHERE ecr.IsDeleted ~~ 0 AND c.Name =',
            name: 'Caller name',
            inNotIn: true
        },
        {
            id: 5,
            inputType: 'text',
            searchValue: 'cnumber',
            databaseField:  'search.EmergencyCaseId IN (SELECT DISTINCT ec.EmergencyCaseId FROM Caller c ' +
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
            databaseField: 'search.Location',
            name: 'Location',
            inNotIn: false
        },
        {
            id: 8,
            inputType: 'text',
            searchValue: 'species',
            databaseField: 'search.AnimalType',
            name: 'Animal type',
            inNotIn: false
        },
        {
            id: 9,
            inputType: 'text',
            searchValue: 'problem',
            databaseField: 'search.Problem',
            name: 'Problem',
            inNotIn: false
        },
        {
            id: 10,
            inputType: 'text',
            searchValue: 'outcome',
            databaseField: 'search.CallOutcome',
            name: 'Result',
            inNotIn: true
        },
        {
            id: 11,
            inputType: 'text',
            searchValue: 'cloc',
            databaseField: 'search.EmergencyCaseId IN ' +
            '( ' +
            '    SELECT EmergencyCaseId ' +
            '    FROM ( ' +
            '    SELECT EmergencyCaseId ' +
            '    FROM ( ' +
            '        SELECT ' +
            '            p.EmergencyCaseId, ' +
            '            ca.Area, ' +
            '            ROW_NUMBER() OVER ( PARTITION BY c.PatientId ORDER BY c.CensusDate DESC, cac.SortAction DESC) RNum ' +
            '        FROM AAU.Census c ' +
            '        INNER JOIN AAU.CensusArea ca ON ca.AreaId ~~ c.AreaId AND c.ActionId <> 2 ' +
            '        INNER JOIN AAU.CensusAction cac ON cac.ActionId ~~ c.ActionId ' +
            '        INNER JOIN AAU.Patient p ON p.PatientId ~~ c.PatientId AND p.PatientStatusId ~~ 1 ' +
            '    ) LatestArea ' +
            '    WHERE LatestArea.RNum ~~ 1 ' +
            '    UNION ' +
            '    SELECT EmergencyCaseId, AAU.fn_GetAreaForAnimalType(p.OrganisationId, p.AnimalTypeId) ' +
            '    FROM AAU.Patient p ' +
            '    WHERE p.PatientStatusId ~~ 1 ' +
            '    ) area ' +
            '    WHERE  ' +
            ') '
            ,
            name: 'Current location',
            inNotIn: false
        },
        {
            id: 12,
            inputType: 'date',
            searchValue: 'releasedate',
            databaseField: 'CAST(search.ReleaseDate AS DATE)',
            name: 'Release date',
            inNotIn: false
        },
        {
            id: 13,
            inputType: 'date',
            searchValue: 'dieddate',
            databaseField: 'CAST(search.DiedDate AS DATE)',
            name: 'Died date',
            inNotIn: false
        },
        {
            id: 14,
            inputType: 'boolean',
            searchValue: 'tycall',
            databaseField: 'search.PatientId IN (SELECT PatientId FROM AAU.PatientCall WHERE CallTypeId=1)',
            name: 'Thanked',
            inNotIn: true
        },
        {
            id: 15,
            inputType: 'text',
            searchValue: 'aka',
            databaseField: 'search.KnownAsName',
            name: 'Known as',
            inNotIn: false
        }
    ];

  constructor(
    public rescueDialog: MatDialog,
    public callDialog: MatDialog,
    private formBuilder: FormBuilder,
    private navigationService: NavigationService,
    public platform: Platform) { }

  ngOnInit(): void {

  this.navigationService.isSearchClicked
  .pipe(takeUntil(this.ngUnsubscribe))
  .subscribe((clicked)=> {
      if(clicked && this.searchBox){
            this.searchBox.nativeElement.focus();
      }
  });

  this.searchForm = this.formBuilder.group({
    searchRows: this.formBuilder.array([])
  });

  this.searchShowing = false;

  this.searchRows = this.searchForm.get('searchRows') as FormArray;

  }

  ngOnDestroy() {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
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

    // If we're on a mobile device, hide the keyboard after searching.
    if (document.activeElement instanceof HTMLElement && (this.platform.ANDROID || this.platform.IOS)) {
        document.activeElement.blur();
      }

    const searchArray = this.getSearchArray();


    const searchQuery = searchArray
        .map(item => {
            const splitItem = item.split(':');

            const option = this.options.find(
                optionVal => optionVal.searchValue === splitItem[0].toLowerCase(),
            );

            // If we're dealing with an IN/NOT IN query, then change the IN/NOT IN depending on
            // what the user has entered into the Search Term field
            if(option?.inNotIn){


                option.databaseField = option.databaseField?.replace(' NOT IN (', ' IN (');

                if(encodeURIComponent(splitItem[1].trim()).toLowerCase() === 'no'){

                    option.databaseField = option.databaseField?.replace(' IN (', ' NOT IN (');
                }

                return option.databaseField + encodeURIComponent(splitItem[1].trim());

            }
            else{

                return option?.databaseField + '=' + encodeURIComponent(splitItem[1].trim());
            }
        })
        .join('&');

     this.searchString.emit(searchQuery);
}

toggleSearchBox() {

    if (this.searchShowing) {
        this.search.searchString = this.getSearchString();
    } else {
        this.updateSearchArray();
        // tslint:disable-next-line:no-unused-expression
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

    // Get the array of form elements and clear it out. We'll rebuild it from the
    // search text box
    this.searchRows = this.searchForm.get('searchRows') as FormArray;
    this.searchRows.clear();

    // Rebuild the search array form the search field
    searchArray.forEach(item => {
        const splitItem = item.split(':');

        const option = this.options.find(
            optionVal => optionVal.searchValue === splitItem[0].toLowerCase(),
        );

        this.searchRows.push(
            this.createItem(option?.id, splitItem[1].trim()),
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

    let firstChar;
    let toSplit = '' + this.search.searchString;

    firstChar = this.search.searchString.toLowerCase().charAt(this.search.searchString.startsWith('%') ? 0 : 1);

    if(this.search.searchString.toLowerCase().search(delimiter) !== 0)
    {
        if( firstChar >='0' && firstChar <='9' && !isNaN(parseInt(this.search.searchString,10))) {
            toSplit = 'emno:' + this.search.searchString;
        }
        else{
            toSplit = 'tagno:' + this.search.searchString;
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

            return option?.searchValue + ':' + item.value.searchTerm;
        })
        .join(' ');

    // Put the formatted string back into the text box.
    return searchText;
}

addRow() {

    this.searchRows.push(this.createItem('', ''));
}

removeRow(i:any) {
    this.searchRows.removeAt(i);
}

}
