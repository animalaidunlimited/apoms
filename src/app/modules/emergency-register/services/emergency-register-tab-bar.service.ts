import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SharedMediaPackage } from 'src/app/core/models/media';

@Injectable({
  providedIn: 'root'
})
export class EmergencyRegisterTabBarService {

  constructor() { }

  sharedMediaItem: BehaviorSubject<File[]> = new BehaviorSubject<File[]>([]);

  addTab(searchPatientBoolean: any) {
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
