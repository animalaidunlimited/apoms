import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SearchResponse } from 'src/app/core/models/responses';

@Injectable({
  providedIn: 'root'
})
export class HospitalManagerTabBarService {

  constructor() { }

  tabCreator:BehaviorSubject<SearchResponse[]> = new BehaviorSubject<SearchResponse[]>([]);

  addTab(searchResponse:SearchResponse[]){

    if(searchResponse.length > 0){
      this.tabCreator.next(searchResponse);
    }

  }
}
