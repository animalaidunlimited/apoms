import { ɵunwrapSafeValue as unwrapSafeValue } from '@angular/core';
import { MediaItem } from '../models/media';



export function setImageLocation(currentItem : MediaItem | undefined) : string {

    let location = "src/assets/images/placeholder.png";

    if(currentItem){
      location = currentItem?.remoteURL !== '' ? currentItem?.remoteURL : unwrapSafeValue(currentItem.localURL);
    }

    return location;
  }
