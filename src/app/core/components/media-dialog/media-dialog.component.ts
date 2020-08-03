import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MediaPasteService } from '../../services/media-paste.service';
import { MediaItem, MediaItemReturnObject } from '../../models/media';
import { Platform } from '@angular/cdk/platform';
import { PatientService } from 'src/app/modules/emergency-register/services/patient.service';
import { of } from 'rxjs';

interface IncomingData {
  tagNumber: string;
  patientId: number;
  pastedImage: File;
}

@Component({
  selector: 'media-dialog',
  templateUrl: './media-dialog.component.html',
  styleUrls: ['./media-dialog.component.scss'],
  host: {
    '(window:paste)': 'handlePaste( $event )',
},
})

export class MediaDialog implements OnInit {

  constructor(public dialogRef: MatDialogRef<MediaDialog>,
    @Inject(MAT_DIALOG_DATA) public data: IncomingData,
    private mediaPaster: MediaPasteService,
    private patientService: PatientService,
    public platform: Platform) { }

    mediaItems: MediaItem [] = [];

    uploading: number = 0;

  ngOnInit(): void {


    this.patientService.getPatientMediaItemsByPatientId(this.data.patientId).subscribe(mediaItems => {


        if(mediaItems){

        this.mediaItems = mediaItems.map(mediaItem => {

        let newItem:MediaItem = {
          mediaItemId: of(mediaItem.mediaItemId),
          mediaType: mediaItem.mediaType,
          localURL: mediaItem.localURL,
          remoteURL: mediaItem.remoteURL,
          datetime: mediaItem.datetime,
          comment: mediaItem.comment,
          patientId: mediaItem.patientId,
          heightPX: mediaItem.heightPX,
          widthPX: mediaItem.widthPX,
          tags: mediaItem.tags,
          uploadProgress$: of(100),
          updated: false
        }

        return newItem;

        });

      };

      if(this.data.pastedImage){
        this.uploadFile(this.data.pastedImage);
      }

    });

  }

public handlePaste(event: ClipboardEvent){

    //Pass the clipboard event down to the service, expect it to return an image file
    let mediaFile: File = this.mediaPaster.getPastedImage(event);

      let mediaItem = this.upload(mediaFile, this.data.patientId)

      this.addToMediaItems(mediaItem.mediaItem);

}

upload(file: File, patientId: number) : MediaItemReturnObject{

  let mediaItem:MediaItemReturnObject = this.mediaPaster.handleUpload(file, patientId);

    mediaItem.mediaItemId.subscribe(result => {
      if(result){
        this.uploading--;
      }
    });

    return mediaItem;

}

uploadFile($event) {

  //We're uploading a file
  this.uploading++;

  for(let file of $event.target.files)
  {
    let mediaItem:MediaItemReturnObject = this.upload(file, this.data.patientId)

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

onSave(): void {

    this.dialogRef.close();
}



}
