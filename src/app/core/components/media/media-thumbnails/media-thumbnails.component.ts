import { map, takeUntil } from 'rxjs/operators';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { MediaItem, SingleMediaItem } from 'src/app/core/models/media';
import { MediaPreviewComponent } from '../media-preview/media-preview.component';
import { MediaService } from 'src/app/core/services/media/media.service';
import { DatePipe } from '@angular/common';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'media-thumbnails',
    templateUrl: './media-thumbnails.component.html',
    styleUrls: ['./media-thumbnails.component.scss']
})
export class MediaThumbnailsComponent implements OnInit, OnDestroy{
    @Input() patientId!:number;
    @Input() limitSize!:boolean;
    @Input() date!:string | Date;

    mediaPatientItems!:MediaItem[];

    @Output() arrowUpAndDown: EventEmitter<{key:number,datetime:string}> = new EventEmitter();
    private ngUnsubscribe = new Subject();

    constructor (
        public dialog: MatDialog,
        private datePipe: DatePipe,
        private mediaService: MediaService
    ) { }

    ngOnInit(): void {

        //If this is being used in the patient record we're only displaying 3 images. Otherwise we're displaying all images
        //for a particular date.
        this.mediaService.getPatientMediaItemsByPatientId(this.patientId).pipe(
            map(elements =>

                this.limitSize ?
                    elements.slice(0,3) :
                    elements.filter(element => this.datePipe.transform(element.datetime, "yyyy-MM-dd") === this.date)

            ))
            .subscribe(elements => this.mediaPatientItems = elements);

    }


    openPreviewDialog(image:MediaItem){

        const dialogRef = this.dialog.open(MediaPreviewComponent, {
            minWidth: '80vw',
            panelClass: 'media-preview-dialog',
            data: {
                mediaData: this.mediaPatientItems.find(media => media.patientMediaItemId === image.patientMediaItemId)
            },
            autoFocus: false
        });

        const sub = dialogRef.componentInstance.onArrowKey.pipe(takeUntil(this.ngUnsubscribe)).subscribe(key => {

            // tslint:disable-next-line: max-line-length
            const mediaDataIndex = this.mediaPatientItems.findIndex(mediaPatientItem => mediaPatientItem?.patientMediaItemId === dialogRef.componentInstance.data.mediaData?.patientMediaItemId);

             if(key === 37){
                if(mediaDataIndex - 1 >= 0){

                    const dialogData: SingleMediaItem = {
                        mediaData :  dialogRef.componentInstance.data.mediaData = this.mediaPatientItems[mediaDataIndex - 1],
                        upload: false,
                        patientId: this.mediaPatientItems[mediaDataIndex - 1].patientId,
                        tagNumber: ""
                    };
                    dialogRef.componentInstance.updateDialog(dialogData);

                }
            }

             if(key === 39){

                if(mediaDataIndex + 1 <= this.mediaPatientItems.length - 1) {

                    const dialogData = {
                        mediaData :  dialogRef.componentInstance.data.mediaData = this.mediaPatientItems[mediaDataIndex + 1],
                        upload: false,
                        patientId: this.mediaPatientItems[mediaDataIndex + 1].patientId,
                        tagNumber: ""
                    };
                    dialogRef.componentInstance.updateDialog(dialogData);
                }
            }


        });
        dialogRef.afterClosed().pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
            sub.unsubscribe();
        });
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}