import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Gallery, Image, MediaItem } from 'src/app/core/models/media';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'media-gallery-dialog',
  templateUrl: './media-gallery-dialog.component.html',
  styleUrls: ['./media-gallery-dialog.component.scss']
})
export class MediaGalleryDialogComponent implements OnInit {

  galleries!:Gallery[];

  
  constructor( @Inject(MAT_DIALOG_DATA) public data: { mediaGallery: Image[], mediaPatientId: number}) { }

  ngOnInit(): void {

    this.galleries = Object.entries(this.data.mediaGallery.reduce((r:any, a:any) => {
      r[a.date] = r[a.date] || [];
      r[a.date].push(a);
      return r;
      }, Object.create(null))).map(media => ({
        date:media[0],
        images:media[1] as Image[]
    }));
  }
  
}
