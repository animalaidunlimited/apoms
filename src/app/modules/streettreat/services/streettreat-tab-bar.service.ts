import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SearchStreetTreatResponse } from 'src/app/core/models/responses';

@Injectable({
  providedIn: 'root'
})
export class StreetTreatTabBarService {

  constructor() { }
  tabCreator:BehaviorSubject<SearchStreetTreatResponse[]> = new BehaviorSubject<SearchStreetTreatResponse[]>([]);

  addTab(searchResponse:SearchStreetTreatResponse[]){

    if(searchResponse.length > 0){
      this.tabCreator.next(searchResponse);
    }

  }
}
