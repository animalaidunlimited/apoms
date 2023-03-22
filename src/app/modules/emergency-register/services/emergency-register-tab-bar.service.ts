import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SharedMediaPackage } from 'src/app/core/models/media';
import { SearchResponse } from 'src/app/core/models/responses';

@Injectable({
  providedIn: 'root'
})
export class EmergencyRegisterTabBarService {

  constructor() { }

  sharedMediaItem: BehaviorSubject<File[]> = new BehaviorSubject<File[]>([]);

  tabCreator:BehaviorSubject<SearchResponse[]> = new BehaviorSubject<SearchResponse[]>([]);

  addTab(searchResponse:SearchResponse[]){

    if(searchResponse.length > 0){
      this.tabCreator.next(searchResponse);
    }

  }


  addSearchTab(searchPatientBoolean: any) {
    if(searchPatientBoolean!=='') {
      this.sharedMediaItem.next(searchPatientBoolean);
    }
  }

  getSharedMediaItem(){
    return this.sharedMediaItem;
  }

  receiveSharedMediaItem(sharedPackage:SharedMediaPackage){

    const sharedItem = sharedPackage.image.length > 0 ? sharedPackage.image : sharedPackage.video;

    this.sharedMediaItem.next(sharedItem);

  }
}
