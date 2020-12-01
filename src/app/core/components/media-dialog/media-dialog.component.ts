import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MediaPasteService } from '../../services/media-paste/media-paste.service';
import { MediaItem, MediaItemReturnObject } from '../../models/media';
import { Platform } from '@angular/cdk/platform';
import { PatientService } from 'src/app/modules/emergency-register/services/patient.service';
import { of, BehaviorSubject } from 'rxjs';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import { MediaCaptureComponent } from '../media-capture/media-capture.component';

interface IncomingData {
  tagNumber: string;
  patientId: number;
  mediaVal: File[];
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'media-dialog',
  templateUrl: './media-dialog.component.html',
  styleUrls: ['./media-dialog.component.scss']
})

export class MediaDialogComponent implements OnInit {

  isPrimaryChanged : BehaviorSubject<number> = new BehaviorSubject<number>(0);

  mediaItems: MediaItem [] = [];

  uploading = 0;

  newItem! : MediaItem;

  primaryMedia! : MediaItem;


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

    this.patientService.getPatientMediaItemsByPatientId(this.data.patientId).subscribe(mediaItems => {

        if(mediaItems){

        this.mediaItems = mediaItems.map((mediaItem:any) => {

         this.newItem  = {
          mediaItemId: mediaItem.mediaItemId,
          patientMediaItemId: mediaItem.patientMediaItemId,
          mediaType: mediaItem.mediaType,
          localURL: mediaItem.localURL,
          remoteURL: mediaItem.remoteURL,
          isPrimary :mediaItem.isPrimary,
          datetime: mediaItem.datetime,
          comment: mediaItem.comment,
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

      this.data.mediaVal.forEach((item:File) => {

        const addedItem = this.upload(item , this.data.patientId);

        if(addedItem.mediaItem){

          this.mediaItems.push(addedItem.mediaItem);
        }
      });

    }

  }


public handlePaste(event: ClipboardEvent){

    // Pass the clipboard event down to the service, expect it to return an image file
    const mediaFile: File | undefined = this.mediaPaster.getPastedImage(event);

    if(mediaFile){

      const mediaItem = this.upload(mediaFile, this.data.patientId);

      if(mediaItem.mediaItem){
        this.addToMediaItems(mediaItem.mediaItem);
      }
    }
}

upload(file: File, patientId: number) : MediaItemReturnObject{

  const mediaItem:MediaItemReturnObject = this.mediaPaster.handleUpload(file, patientId);
    mediaItem.mediaItemId.subscribe(result => {
      if(result){
        this.uploading--;
      }
    });

    return mediaItem;

}

uploadFile($event:any) {

  // We're uploading a file
  this.uploading++;

  for(const file of $event.target.files)
  {
    const mediaItem:MediaItemReturnObject = this.upload(file, this.data.patientId);

    if(mediaItem.result === 'nomedia'){
      this.snackbar.errorSnackBar('Upload images or video only','OK');
    }
    else if(mediaItem.mediaItem){

      this.addToMediaItems(mediaItem.mediaItem);

    }

  }

}

addToMediaItems(item: MediaItem){

  if(!this.mediaItems){
    this.mediaItems = [];
  }

  this.mediaItems.unshift(item);

}

onMediaItemDeleted(deletedMediaItem: MediaItem){

  this.mediaItems = this.mediaItems.filter(mediaItem =>
          mediaItem.mediaItemId !== deletedMediaItem.mediaItemId
  );

}

clearPrimary(){
  this.mediaItems.forEach(mediaItem=>{
    mediaItem.isPrimary = false;
  });
}

onMediaUpdate(updatedMedia:MediaItem){
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
}


}
