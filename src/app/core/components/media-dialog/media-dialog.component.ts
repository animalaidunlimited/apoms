import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MediaPasteService } from '../../services/media-paste.service';
import { MediaItem, MediaItemReturnObject } from '../../models/media';
import { Platform } from '@angular/cdk/platform';
import { PatientService } from 'src/app/modules/emergency-register/services/patient.service';
import { of, BehaviorSubject } from 'rxjs';
import { SnackbarService } from '../../services/snackbar/snackbar.service';

interface IncomingData {
  tagNumber: string;
  patientId: number;
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

  newItem : MediaItem;

  primaryMedia : MediaItem;


  @HostListener('window:paste', ['$event']) handleWindowPaste( $event ){
    this.handlePaste( $event);
  }

  constructor(public dialogRef: MatDialogRef<MediaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IncomingData,
    private mediaPaster: MediaPasteService,
    private patientService: PatientService,
    private snackbar: SnackbarService,
    public platform: Platform) { }

  ngOnInit(): void {


    this.patientService.getPatientMediaItemsByPatientId(this.data.patientId).subscribe(mediaItems => {

        if(mediaItems){

        this.mediaItems = mediaItems.map(mediaItem => {

         this.newItem  = {
          mediaItemId: of(mediaItem.mediaItemId),
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
          updated: false
        };
        return this.newItem;
        });

      }
    });

  }


public handlePaste(event: ClipboardEvent){

    // Pass the clipboard event down to the service, expect it to return an image file
    const mediaFile: File = this.mediaPaster.getPastedImage(event);

      const mediaItem = this.upload(mediaFile, this.data.patientId);

      this.addToMediaItems(mediaItem.mediaItem);

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

uploadFile($event) {

  // We're uploading a file
  this.uploading++;

  for(const file of $event.target.files)
  {
    const mediaItem:MediaItemReturnObject = this.upload(file, this.data.patientId);

    mediaItem.result === 'nomedia' ?
      this.snackbar.errorSnackBar('Upload images or video only','OK')
      :
      this.addToMediaItems(mediaItem.mediaItem);

  }

}

addToMediaItems(item: MediaItem){

  if(!this.mediaItems){
    this.mediaItems = [];
  }

  this.mediaItems.unshift(item);

}

onMediaItemDeleted(deletedMediaItem: MediaItem){

  this.mediaItems = this.mediaItems.filter((mediaItem) => {

    return mediaItem.mediaItemId !== deletedMediaItem.mediaItemId;
  });

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


}
