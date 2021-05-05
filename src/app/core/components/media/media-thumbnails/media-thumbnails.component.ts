import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Image, MediaItem } from 'src/app/core/models/media';
import { MediaPreviewComponent } from '../media-preview/media-preview.component';

import { PatientService } from 'src/app/core/services/patient/patient.service';
@Component({
    // tslint:disable-next-line: component-selector
    selector: 'media-thumbnails',
    templateUrl: './media-thumbnails.component.html',
    styleUrls: ['./media-thumbnails.component.scss']
})
export class MediaThumbnailsComponent implements OnInit{
    @Input() gallery!:Image[];
    @Input() mediaData!:BehaviorSubject<MediaItem[]>;
    mediaDataImages:MediaItem[] = [];
    private ngUnsubscribe = new Subject();
    constructor (
        public dialog: MatDialog,        
        private patientService:PatientService
    ) {}

    ngOnInit(): void {
        
    }
    openPreviewDialog(image:Image){
        const orientation = image?.height && image?.width ?  image?.height > image?.width ? 'Landscape' : 'Potrait' : '';
        // console.log(orientation);

        this.patientService.getPatientMediaItemsByPatientId(this.mediaData?.value[0].patientId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((mediaItems:MediaItem[]) => 
            this.mediaDataImages = mediaItems
        );
        const dialogRef = this.dialog.open(MediaPreviewComponent, {
            minWidth: '80vw',
            panelClass: 'media-preview-dialog',
            data: {
                image,
                mediaData: this.mediaDataImages.filter(media => media.patientMediaItemId === image.patientMediaItemId)[0]
            }
        });
        const onUpdateMedia = dialogRef.componentInstance.onUpdateMediaItem.subscribe(() => {
            this.patientService.getPatientMediaItemsByPatientId(this.mediaData?.value[0].patientId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((mediaItems:MediaItem[]) => 
                this.mediaDataImages = mediaItems
            );
        });
        dialogRef.afterClosed().subscribe(()=> onUpdateMedia.unsubscribe());
        
    }
    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}