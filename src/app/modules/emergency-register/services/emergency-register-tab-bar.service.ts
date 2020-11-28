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

    console.log('SharedMediaItem.next');
    console.log(sharedPackage.image);
    console.log(sharedPackage.video);

    const sharedItem = sharedPackage.image || sharedPackage.video;

    console.log('sharedItem');
    console.log(sharedItem);

    this.sharedMediaItem.next(sharedItem);

    console.log(this.sharedMediaItem.getValue());

  }
}
