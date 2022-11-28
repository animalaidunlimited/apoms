import { Component, Inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { Gallery,  MediaItem } from 'src/app/core/models/media';
import { MediaService } from 'src/app/core/services/media/media.service';
import { MediaThumbnailsComponent } from '../media-thumbnails/media-thumbnails.component';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'media-gallery-dialog',
  templateUrl: './media-gallery-dialog.component.html',
  styleUrls: ['./media-gallery-dialog.component.scss']
})
export class MediaGalleryDialogComponent implements OnInit {

  @ViewChildren(MediaThumbnailsComponent) mediaThumbnailsComponent!: QueryList<MediaThumbnailsComponent>;

  mediaGalleryDates!: Observable<string[]>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { patientId: number },
    private mediaService: MediaService
    ) { }

  ngOnInit(): void {

    this.mediaGalleryDates = this.mediaService.getGalleryDatesForPatientId(this.data.patientId);

  }

}

