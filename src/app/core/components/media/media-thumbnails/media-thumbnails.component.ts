import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Subject } from 'rxjs';
import { Image, MediaItem } from 'src/app/core/models/media';
import { MediaPreviewComponent } from '../media-preview/media-preview.component';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'media-thumbnails',
    templateUrl: './media-thumbnails.component.html',
    styleUrls: ['./media-thumbnails.component.scss']
})
export class MediaThumbnailsComponent implements OnInit, OnDestroy{
    @Input() gallery!:Image[];
    @Input() mediaPatientItems!:BehaviorSubject<MediaItem[]>;

    @Output() updatedMediaItem:EventEmitter<MediaItem> = new EventEmitter();

    private ngUnsubscribe = new Subject();

    constructor (
        public dialog: MatDialog
    ) {}

    ngOnInit(): void {

    }

    openPreviewDialog(image:Image){


        // this.updatedMediaItem.emit(true);
        const dialogRef = this.dialog.open(MediaPreviewComponent, {
            minWidth: '80vw',
            panelClass: 'media-preview-dialog',
            data: {
                image,
                mediaData: this.mediaPatientItems.value.filter(media => media.patientMediaItemId === image.patientMediaItemId)[0]
            },
            autoFocus: false
        });

        const onUpdateMedia = dialogRef.componentInstance.onUpdateMediaItem.subscribe((mediaItem:MediaItem) => {
            this.updatedMediaItem.emit(mediaItem);
        });
        // tslint:disable-next-line: deprecation
        dialogRef.afterClosed().subscribe(() => onUpdateMedia.unsubscribe());

    }
    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}