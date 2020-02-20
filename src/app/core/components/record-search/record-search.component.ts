import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormArray} from '@angular/forms';
import { trigger, state, style, animate, transition} from '@angular/animations';

export interface SearchValue {
  id: number;
  searchValue: string;
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
      {"id":0, "searchValue": null, "name":null},
      {"id":1, "searchValue": "EmNo", "name":"Em. No."},
      {"id":2, "searchValue": "Date", "name":"Date"},
      {"id":3, "searchValue": "TagNo", "name":"Tag No."},
      {"id":4, "searchValue": "CName", "name":"Complainer Name"},
      {"id":5, "searchValue": "CNo", "name":"Complainer No."},
      {"id":6, "searchValue": "Loc", "name":"Location"},
      {"id":7, "searchValue": "Area", "name":"Area"},
      {"id":8, "searchValue": "AType", "name":"Animal Type"},
      {"id":9, "searchValue": "Prob", "name":"Problem"},
      {"id":10, "searchValue": "Result", "name":"Result"},
      {"id":11, "searchValue": "CLoc", "name":"Current Location"},
      {"id":12, "searchValue": "RD", "name":"Release Date"},
      {"id":13, "searchValue": "DD", "name":"Died Date"}
  ];


  constructor(private formBuilder: FormBuilder) {}

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

  this.search.searchString = searchFieldArray.map(item => {

    return item.searchField + ":" + item.searchTerm;

  });


this.toggleSearchBox();

//TODO Implement search
alert("Performing Search");

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