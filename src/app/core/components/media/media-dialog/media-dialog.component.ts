import { Component, OnInit, Inject, HostListener, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Platform } from '@angular/cdk/platform';
import { of, BehaviorSubject, Subject } from 'rxjs';
import { MediaCaptureComponent } from '../media-capture/media-capture.component';
import { takeUntil } from 'rxjs/operators';
import { MediaPasteService } from 'src/app/core/services/navigation/media-paste/media-paste.service';
import { MediaItem, MediaItemReturnObject } from 'src/app/core/models/media';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';

interface IncomingData {
  tagNumber: string;
  patientId: number;
  mediaVal: File[];
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'media-dialog',
  templateUrl: './media-dialog.component.html',
  styleUrls: ['./media-dialog.component.scss']
})

export class MediaDialogComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  isPrimaryChanged : BehaviorSubject<number> = new BehaviorSubject<number>(0);

  mediaItems: MediaItem [] = [];

  newItem! : MediaItem;

  primaryMedia! : MediaItem;

  uploading = 0;


  @HostListener('window:paste', ['$event']) handleWindowPaste( $event:any ){
    this.handlePaste( $event);
  }

  constructor(public dialogRef: MatDialogRef<MediaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IncomingData,
    private mediaPaster: MediaPasteService,
    private patientService: PatientService,
    public dialog: MatDialog,
    private snackbar: SnackbarService,
    public platform: Platform) { }

  ngOnInit(): void {

    this.patientService.getPatientMediaItemsByPatientId(this.data.patientId)
    .pipe(takeUntil(this.ngUnsubscribe))
    // tslint:disable-next-line: deprecation
    .subscribe(mediaItems => {

        if(mediaItems){

          this.mediaItems = mediaItems.map(mediaItem => {

          this.newItem  = {
            mediaItemId: mediaItem.mediaItemId,
            patientMediaItemId: mediaItem.patientMediaItemId,
            mediaType: mediaItem.mediaType,
            localURL: mediaItem.localURL,
            remoteURL: mediaItem.remoteURL,
            isPrimary :mediaItem.isPrimary,
            datetime: mediaItem.datetime,
            patientId: mediaItem.patientId,
            heightPX: mediaItem.heightPX,
            widthPX: mediaItem.widthPX,
            tags: mediaItem.tags,
            uploadProgress$: of(100),
            updated: false,
            deleted: false
          };
          return this.newItem;
        });

      }
    });

    if(this.data.mediaVal) {

      this.data.mediaVal.forEach(item => {

        const addedItem = this.upload(item , this.data.patientId);

        if(addedItem.mediaItem){

          this.mediaItems.push(addedItem.mediaItem);
        }
      });

    }

  }

  ngOnDestroy() {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
  }


public handlePaste(event: ClipboardEvent) : void {

    // Pass the clipboard event down to the service, expect it to return an image file
    const mediaFile: File | undefined = this.mediaPaster.getPastedImage(event);

    if(mediaFile){

      const mediaItem = this.upload(mediaFile, this.data.patientId);

      if(mediaItem.mediaItem){
        this.addToMediaItems(mediaItem.mediaItem);
      }
    }
}

upload(file: File, patientId: number) : MediaItemReturnObject {

  const mediaItem:MediaItemReturnObject = this.mediaPaster.handleUpload(file, patientId);
    mediaItem.mediaItemId
    .pipe(takeUntil(this.ngUnsubscribe))
    // tslint:disable-next-line: deprecation
    .subscribe(result => {
      if(result){
        this.uploading--;
      }
    });

    return mediaItem;

}

uploadFile($event:any) : void {

  // We're uploading a file
  this.uploading++;

  for(const file of $event.target.files)
  {
    const mediaItem:MediaItemReturnObject = this.upload(file, this.data.patientId);

    if(mediaItem.result === 'nomedia'){
      this.snackbar.errorSnackBar('Upload images or video only','OK');
    }
    else if(mediaItem.mediaItem){

      mediaItem.mediaItem.updated = true;

      this.addToMediaItems(mediaItem.mediaItem);

    }

  }

}

addToMediaItems(item: MediaItem) : void {

  if(!this.mediaItems){
    this.mediaItems = [];
  }

  this.mediaItems.unshift(item);

}

onMediaItemDeleted(deletedMediaItem: MediaItem) : void {

  this.mediaItems = this.mediaItems.filter(mediaItem =>
          mediaItem.mediaItemId !== deletedMediaItem.mediaItemId
  );

}

clearPrimary() : void {
  this.mediaItems.forEach(mediaItem=>{
    mediaItem.isPrimary = false;
  });
}

onMediaUpdate(updatedMedia:MediaItem) : void {
  if(updatedMedia.isPrimary === true){
    this.primaryMedia = updatedMedia;
  }
}

onSave(): void {
  if(this.primaryMedia){
    this.dialogRef.close(this.primaryMedia);
  }
  else{
    this.dialogRef.close();
  }
}

openMobileMediaCaptureDialog(){

  const dialogRef = this.dialog.open(MediaCaptureComponent, {
    maxWidth: '100vw',
    maxHeight: '100vh',
    panelClass: 'media-capture-dialog',
    data: {
        tagNumber: this.data.tagNumber,
        patientId: this.data.patientId,
    }
  });

  dialogRef.componentInstance.closeMediaDialog.subscribe(() => dialogRef.close());

}


}
