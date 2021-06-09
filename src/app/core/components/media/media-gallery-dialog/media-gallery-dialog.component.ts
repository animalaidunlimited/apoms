import { Component, Inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { Gallery, MediaItem } from 'src/app/core/models/media';
import { MediaThumbnailsComponent } from '../media-thumbnails/media-thumbnails.component';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'media-gallery-dialog',
  templateUrl: './media-gallery-dialog.component.html',
  styleUrls: ['./media-gallery-dialog.component.scss']
})
export class MediaGalleryDialogComponent implements OnInit {

  @ViewChildren(MediaThumbnailsComponent) mediaThumbnailsComponent!: QueryList<MediaThumbnailsComponent>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data:
    {
      mediaGallery: Gallery[],
      mediaPatientItems: BehaviorSubject<MediaItem[]>
    }) { }

  ngOnInit(): void {

  }
  arrowKeyBindings($event:{key:number, datetime:string}){
    const galleryIndex = this.data.mediaGallery.findIndex(gal => gal.date   === $event.datetime);

    console.log(this.mediaThumbnailsComponent);
    if($event.key === 38){
      console.log( this.data.mediaGallery[galleryIndex - 1]);
    }
    
  }
}

