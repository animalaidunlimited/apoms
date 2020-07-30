import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from 'src/app/modules/emergency-register/components/tag-number-dialog/tag-number-dialog.component';
import { MediaPasteService } from '../../services/media-paste.service';
import { MediaItem, MediaItemReturnObject } from '../../models/media';
import { Platform } from '@angular/cdk/platform';
import { PatientService } from 'src/app/modules/emergency-register/services/patient.service';
import { BehaviorSubject, from, of, Observable } from 'rxjs';

interface MediaItemCombined {
  mediaItems: MediaItem[],
  mediaItemId: BehaviorSubject<number>[]
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
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private mediaPaster: MediaPasteService,
    private patientService: PatientService,
    public platform: Platform) { }

    mediaItems: MediaItem [] = [];

    uploading: number = 0;

  ngOnInit(): void {

    this.patientService.getPatientMediaItemsByPatientId(this.data.patientId).subscribe(mediaItems => {

      if(!mediaItems){
        return;
      }

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

    });

  }

handlePaste(event: ClipboardEvent){

    //Pass the clipboard event down to the service, expect it to return a new media item
    let mediaObject: MediaItem = this.mediaPaster.handlePaste(event, this.data.patientId);

    this.addToMediaItems(mediaObject);

}

uploadFile($event) {

  //We're uploading a file
  this.uploading++;

  for(let file of $event.target.files)
  {
    let mediaItem:MediaItemReturnObject = this.mediaPaster.handleUpload(file, this.data.patientId);

    mediaItem.mediaItemId.subscribe(result => {
      if(result){
        this.uploading--;
      }
    })

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
