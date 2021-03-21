import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchStreetTreatResponse } from 'src/app/core/models/responses';
import { StreetTreatService } from '../../services/streettreat.service';


@Component({
  selector: 'app-streettreat-search',
  templateUrl: './streettreat-search.component.html',
  styleUrls: ['./streettreat-search.component.scss']
})
export class StreetTreatSearchComponent implements OnInit {

  @Output() public openStreetTreatCase = new EventEmitter<SearchStreetTreatResponse>();

  constructor(
    private streetTreatService: StreetTreatService,
  ) { }

  searchResults$!:Observable<SearchStreetTreatResponse[]>;

  ngOnInit(): void {
  }

  onSearchQuery(searchQuery:string){
  this.searchResults$ = this.streetTreatService.searchCases(searchQuery);
  }
  
  openCase(searchResult: SearchStreetTreatResponse) {
    this.openStreetTreatCase.emit(searchResult);
  }
}
