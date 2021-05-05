import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Image, MediaItem } from 'src/app/core/models/media';
import { MediaPreviewComponent } from '../media-preview/media-preview.component';
@Component({
    // tslint:disable-next-line: component-selector
    selector: 'media-thumbnails',
    templateUrl: './media-thumbnails.component.html',
    styleUrls: ['./media-thumbnails.component.scss']
})
export class MediaThumbnailsComponent implements OnInit{
    @Input() gallery!:Image[];
    @Input() mediaData!:BehaviorSubject<MediaItem[]>;
    private ngUnsubscribe = new Subject();
    constructor (public dialog: MatDialog) {}

    ngOnInit(): void {
        
    }
    openPreviewDialog(image:Image){
        const orientation = image?.height && image?.width ?  image?.height > image?.width ? 'Landscape' : 'Potrait' : '';
        // console.log(orientation);

      
        const dialogRef = this.dialog.open(MediaPreviewComponent, {
            minWidth: '80vw',
            panelClass: 'media-preview-dialog',
            data: {
                image,
                mediaData: this.mediaData?.value.filter(media => media.patientMediaItemId === image.patientMediaItemId)[0]
            }
        });
        const subscribeDialog = dialogRef.componentInstance.onUpdateMediaItem.pipe(takeUntil(this.ngUnsubscribe)).subscribe((mediaItem:MediaItem) => {
            console.log(mediaItem); 
        });
        dialogRef.afterClosed().subscribe(() => subscribeDialog.unsubscribe());
        
    }
    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}