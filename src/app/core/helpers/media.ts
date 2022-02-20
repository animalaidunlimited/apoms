import { ɵunwrapSafeValue as unwrapSafeValue } from '@angular/core';
import { MediaItem } from '../models/media';



export function getImageLocation(currentItem : MediaItem | undefined) : string {

    let location = "assets/images/image_placeholder.png";

    if(currentItem){
      location = currentItem?.remoteURL !== '' ? currentItem?.remoteURL : unwrapSafeValue(currentItem.localURL);
    }

    return location;
  }
