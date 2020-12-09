import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchStreetTreatResponse } from 'src/app/core/models/responses';


@Component({
  selector: 'app-streettreat-search',
  templateUrl: './streettreat-search.component.html',
  styleUrls: ['./streettreat-search.component.scss']
})
export class StreettreatSearchComponent implements OnInit {

  constructor() { }
  searchResults$!:Observable<SearchStreetTreatResponse[]>;
  ngOnInit(): void {
  }

  onSearchQuery(searchQuery:string){
    console.log("I worked");  
  }
}
