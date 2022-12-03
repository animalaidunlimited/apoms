import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SearchStreetTreatResponse } from 'src/app/core/models/responses';

@Component({
  selector: 'app-search-streettreat-result-card',
  templateUrl: './search-streettreat-result-card.component.html',
  styleUrls: ['./search-streettreat-result-card.component.scss']
})
export class SearchStreetTreatResultCardComponent implements OnInit {

  @Input() record!:SearchStreetTreatResponse;

  @Output() public openStreetTreatCase = new EventEmitter<SearchStreetTreatResponse>();

  openCase(streetTreatCaseSearchResult: SearchStreetTreatResponse) {
    this.openStreetTreatCase.emit(streetTreatCaseSearchResult);
  }
  constructor() { }

  ngOnInit(): void {

  }

}
