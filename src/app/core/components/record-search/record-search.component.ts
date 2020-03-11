import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormArray} from '@angular/forms';
import { trigger, state, style, animate, transition} from '@angular/animations';
import { CaseService } from 'src/app/pages/modules/emergency-register/services/case.service';

export interface SearchValue {
  id: number;
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
  animations:
  [
    trigger("expandSearch",
    [
      state("open",style({
      width: "525px"
    })),
    state("closed", style({
      width: "175px"
    })),
    transition("open => closed", [
      animate(".2s")
    ]),
    transition("closed => open", [
      animate(".2s")
    ])
  ]),
    trigger("expandSearchForm",
    [
      state("open",style({
      width: "525px"

    })),
    state("closed", style({
      display: "none",
      height: "0px",
      width: "0px"
    })),
    transition("open => closed", [
      animate(".2s")
    ]),
    transition("closed => open", [
      animate(".2s")
    ])

  ])
]
})
export class RecordSearchComponent implements OnInit{

  searchFieldForm = new FormControl();

  searchForm:FormGroup;
  searchRows:FormArray;

  searchShowing = false;

  search = new Search();

  options: SearchValue[] = [
      {"id":0, "searchValue": null, "databaseField":null, "name":null},
      {"id":1, "searchValue": "EmNo", "databaseField":"ec.EmergencyNumber", "name":"Em. No."},
      {"id":2, "searchValue": "Date", "databaseField":"ec.CallDateTime", "name":"Date"},
      {"id":3, "searchValue": "TagNo", "databaseField":"p.TagNumber", "name":"Tag No."},
      {"id":4, "searchValue": "CName", "databaseField":"c.Name", "name":"Caller Name"},
      {"id":5, "searchValue": "CNo", "databaseField":"c.Number", "name":"Caller No."},
      {"id":6, "searchValue": "Loc", "databaseField":"ec.Location", "name":"Location"},
      {"id":7, "searchValue": "Area", "databaseField":"", "name":"Area"},
      {"id":8, "searchValue": "AType", "databaseField":"at.AnimalType", "name":"Animal Type"},
      {"id":9, "searchValue": "Prob", "databaseField":"pp.Problem", "name":"Problem"},
      {"id":10, "searchValue": "Result", "databaseField":"o.Outcome", "name":"Result"},
      {"id":11, "searchValue": "CLoc", "databaseField":"", "name":"Current Location"},
      {"id":12, "searchValue": "RD", "databaseField":"p.ReleaseDate", "name":"Release Date"},
      {"id":13, "searchValue": "DD", "databaseField":"p.DiedDate", "name":"Died Date"}
  ];


  constructor(
    private formBuilder: FormBuilder,
    private caseService: CaseService) {}

  searchResults$;

  ngOnInit() {

        this.searchForm = this.formBuilder.group({
        searchRows: this.formBuilder.array([ this.createItem() ])
      });
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      searchField: '',
      searchTerm: ''
    });
  }

  displayFn(user?: SearchValue): string | undefined {
    return user ? user.name : undefined;
  }



executeSearch()
{

  this.searchRows = this.searchForm.get('searchRows') as FormArray;
  var searchFieldArray = this.searchRows.value;

  let ampersandRequired = searchFieldArray.filter(item => item.searchTerm != "").length > 0 ? "&" : "";

  let searchArrayString = ampersandRequired + searchFieldArray.map(item => {

    return item.searchTerm ? item.searchField.databaseField + "=" + encodeURIComponent(item.searchTerm) : "";

  }).join("&").replace(" ", "+");

  let tagStart = this.search.searchString.indexOf("&") == -1 ? this.search.searchString.length : this.search.searchString.indexOf("&");

  let searchQuery = "p.TagNumber=" + this.search.searchString.substr(0,tagStart).replace("TagNo=","") + searchArrayString;


  let firstItem = this.search.searchString.indexOf(searchFieldArray[0].searchField.searchValue) == -1
  ? this.search.searchString.length
  : this.search.searchString.indexOf(searchFieldArray[0].searchField.searchValue);

console.log("searchFieldArray.length: " + JSON.stringify(searchFieldArray))

let spaceRequired = searchFieldArray.filter(item => item.searchTerm != "").length > 0 ? " " : "";

  let userSearchString = this.search.searchString.substr(0,firstItem).trim() + spaceRequired + searchFieldArray.map(item => {

    return item.searchTerm ? item.searchField.searchValue + ":" + item.searchTerm : "";

  }).join(" ");

  this.search.searchString = userSearchString;

if(this.searchShowing){
  this.toggleSearchBox();
}


//TODO Implement search
alert("Performing Search: " + searchQuery);



this.searchResults$ = this.caseService.searchCases(searchQuery);

}

toggleSearchBox()
{
  this.searchShowing = !this.searchShowing;
}

addRow() {

  this.searchRows = this.searchForm.get('searchRows') as FormArray;
  this.searchRows.push(this.createItem());

}

removeRow(i)
{
  this.searchRows.removeAt(i)
}
}