import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SearchStreetTreatResponse } from 'src/app/core/models/responses';

@Component({
  selector: 'app-search-streettreet-result-card',
  templateUrl: './search-streettreet-result-card.component.html',
  styleUrls: ['./search-streettreet-result-card.component.scss']
})
export class SearchStreetTreetResultCardComponent implements OnInit {

  @Input() record!:SearchStreetTreatResponse;

  @Output() public openStreetTreatCase = new EventEmitter<SearchStreetTreatResponse>();

  openCase(streetTreatCaseSearchResult: SearchStreetTreatResponse) {

    this.openStreetTreatCase.emit(streetTreatCaseSearchResult);
  }
  constructor() { }

  ngOnInit(): void {

  }

}
