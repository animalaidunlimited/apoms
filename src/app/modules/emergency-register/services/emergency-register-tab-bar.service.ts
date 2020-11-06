import { Injectable } from '@angular/core';
import { SearchResponse } from 'src/app/core/models/responses';
import { BehaviorSubject } from 'rxjs';
import { SearchResultCardComponent } from 'src/app/core/components/search-result-card/search-result-card.component';

@Injectable({
  providedIn: 'root'
})
export class EmergencyRegisterTabBarService {

  constructor() { }

  searchDialog: BehaviorSubject<any> = new BehaviorSubject<any>('');

  addTab(searchPatientBoolean: any) {
    if(searchPatientBoolean!=='') {
      this.searchDialog.next(searchPatientBoolean);
    }
  }
}
