import {  Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
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

   
    private ngUnsubscribe = new Subject();

    constructor (
        public dialog: MatDialog
    ) {}

    ngOnInit(): void {

    }

    openPreviewDialog(image:Image){
        const dialogRef = this.dialog.open(MediaPreviewComponent, {
            minWidth: '80vw',
            panelClass: 'media-preview-dialog',
            data: {
                image,
                mediaData: this.mediaPatientItems.value.filter(media => media.patientMediaItemId === image.patientMediaItemId)[0]
            },
            autoFocus: false
        });
        const sub = dialogRef.componentInstance.onArrowKey.subscribe(() => {
            // tslint:disable-next-line: max-line-length
            const mediaDataIndex = this.mediaPatientItems.value.findIndex(mediaPatientItem => mediaPatientItem.patientMediaItemId === dialogRef.componentInstance.data.mediaData.patientMediaItemId);
            const imageIndex = this.gallery.findIndex(gal => gal.patientMediaItemId === dialogRef.componentInstance.data.image.patientMediaItemId);

            if(imageIndex - 1 >= 0 && mediaDataIndex - 1 >= 0){
               
                const dialogData = {
                    image : this.gallery[imageIndex - 1],
                    mediaData :  dialogRef.componentInstance.data.mediaData = this.mediaPatientItems.value[mediaDataIndex -1]
                };
                dialogRef.componentInstance.updateDialog(dialogData);
            }
           
            
        });
        dialogRef.afterClosed().subscribe(() => {
            sub.unsubscribe();
        });
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}