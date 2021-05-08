import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { Gallery, MediaItem } from 'src/app/core/models/media';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'media-gallery-dialog',
  templateUrl: './media-gallery-dialog.component.html',
  styleUrls: ['./media-gallery-dialog.component.scss']
})
export class MediaGalleryDialogComponent implements OnInit {

  @Output() resetGallery: EventEmitter<boolean> = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data:
                                      {
                                        mediaGallery: Gallery[],
                                        mediaPatientItems: BehaviorSubject<MediaItem[]>
                                      }) { }

  ngOnInit(): void {

  }
  updatedMediaItemsFromGallery(){
    this.resetGallery.emit(true);
  }
}
