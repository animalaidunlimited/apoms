import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
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
export class MediaThumbnailsComponent implements OnInit, OnDestroy{
    @Input() gallery!:Image[];
    @Input() mediaPatientId!:number;
    mediaDataImages:MediaItem[] = [];
    private ngUnsubscribe = new Subject();
    constructor (
        public dialog: MatDialog,        
        private patientService:PatientService
    ) {}

    ngOnInit(): void {
        
    }
    openPreviewDialog(image:Image){
        this.updatePatientMediaData();
        const dialogRef = this.dialog.open(MediaPreviewComponent, {
            minWidth: '80vw',
            panelClass: 'media-preview-dialog',
            data: {
                image,
                mediaData: this.mediaDataImages.filter(media => media.patientMediaItemId === image.patientMediaItemId)[0]
            }
        });
        const onUpdateMedia = dialogRef.componentInstance.onUpdateMediaItem.subscribe(() => {
            this.updatePatientMediaData();
        });
        dialogRef.afterClosed().subscribe(()=> onUpdateMedia.unsubscribe());
        
    }
    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    updatePatientMediaData(){
        this.patientService.getPatientMediaItemsByPatientId(this.mediaPatientId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((mediaItems:MediaItem[]) => 
            this.mediaDataImages = mediaItems
        );
    }
}