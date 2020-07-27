import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from 'src/app/modules/emergency-register/components/tag-number-dialog/tag-number-dialog.component';
import { MediaPasteService } from '../../services/media-paste.service';
import { MediaItem } from '../../models/media';
import { Platform } from '@angular/cdk/platform';
import { PatientService } from 'src/app/modules/emergency-register/services/patient.service';

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

    mediaItems: MediaItem[] = [];

  ngOnInit(): void {

    this.patientService.getPatientMediaItemsByPatientId(this.data.patientId).subscribe(mediaItems => {

      this.mediaItems = mediaItems;

    });



    // let item1:MediaItem = {
    //   mediaItemId: 1,
    //   mediaType: 'image',
    //   localURL: 'https://drive.google.com/uc?id=1NquD4h4B4-vwxZVJXp7DNruB6Pa-KfGt',
    //   remoteURL: '',
    //   datetime: '2020-12-07T11:51',
    //   comment: 'Pixie is such a beautiful little princess',
    //   patientId: this.data.patientId,
    //   heightPX: 243,
    //   widthPX: 432,
    //   tags: ['beautiful', 'gorgeous', 'incredible', 'sweet'],
    //   uploadProgress: null,
    //   updated: false
    // };

    // this.mediaItems.push(item1);

    // let item2:MediaItem =
    // {
    // mediaItemId: 2,
    // mediaType: 'image',
    // localURL: 'https://drive.google.com/uc?id=1lbTytpMSxtL3hZKAWwgLwNBrk_HZQI65',
    // remoteURL: '',
    // datetime: '2020-12-07T11:52',
    // comment: 'Just look how preciuos Pixie is, omg.',
    // patientId: this.data.patientId,
    // heightPX: 243,
    // widthPX: 432,
    // tags: ['amazing', 'beautiful', 'precious', 'my baby'],
    // uploadProgress: null,
    // updated: false
    // }

    // this.mediaItems.push(item2);

    // let item3:MediaItem = {
    // mediaItemId: 3,
    // mediaType: 'video',
    // localURL: 'https://drive.google.com/uc?id=1EWt6ZMgP2WUDGd2_UCehzRp1jucPMbbB',
    // remoteURL: '',
    // datetime: '2020-12-07T11:53',
    // comment: 'Here she is fully enjoying a run!',
    // patientId: 1,
    // heightPX: 640,
    // widthPX: 352,
    // tags: ['running', 'fast', 'cuddles'],
    // uploadProgress: null,
    // updated: false
    // }

    // this.mediaItems.push(item3);

  }

handlePaste(event: ClipboardEvent){

    //Pass the clipboard event down to the service, expect it to return an image URL
    let mediaObject: MediaItem = this.mediaPaster.handlePaste(event, this.data.patientId);

    if(!this.mediaItems){
      this.mediaItems = [];
    }
    this.mediaItems.unshift(mediaObject);

}

uploadFile($event) {

  for(let file of $event.target.files)
  {
    this.mediaPaster.handleUpload(file, this.data.patientId).then((mediaItem:MediaItem) =>
    {

      console.log(mediaItem);

      if(!this.mediaItems){
        this.mediaItems = [];
      }
      this.mediaItems.unshift(mediaItem);

    } );


  }

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
