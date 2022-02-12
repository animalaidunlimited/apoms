import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { SearchStreetTreatResponse } from 'src/app/core/models/responses';
import { StreetTreatService } from '../../services/streettreat.service';


@Component({
  selector: 'app-streettreat-search',
  templateUrl: './streettreat-search.component.html',
  styleUrls: ['./streettreat-search.component.scss']
})
export class StreetTreatSearchComponent implements OnInit {

  private ngUnsubscribe = new Subject();

  @Output() public openStreetTreatCase = new EventEmitter<SearchStreetTreatResponse>();

  loading = false;
  noResults = false;

  constructor(
    private streetTreatService: StreetTreatService,
  ) { }

  searchResults$!:Observable<SearchStreetTreatResponse[]>;

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
}

  onSearchQuery(searchQuery:string){

    this.loading = true;
    this.noResults = false;

    this.searchResults$ = this.streetTreatService.searchCases(searchQuery).pipe(takeUntil(this.ngUnsubscribe), map( result => {

        this.noResults = result.length === 0;

        this.loading = false;

        return result;

      })
    );


  }

  openCase(searchResult: SearchStreetTreatResponse) {
    this.openStreetTreatCase.emit(searchResult);
  }
}
