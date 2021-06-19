import { ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SafeUrl } from '@angular/platform-browser';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@animalaidunlimited/ngx-gallery-aau';
import { Subject, timer } from 'rxjs';
import { finalize, take, takeUntil } from 'rxjs/operators';
import { MediaPasteService } from '../../../services/navigation/media-paste/media-paste.service';


interface IncomingData {
  tagNumber: string;
  patientId: number;
}

@Component({
  selector: 'app-media-capture',
  templateUrl: './media-capture.component.html',
  styleUrls: ['./media-capture.component.scss']
})
export class MediaCaptureComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  @ViewChild('video', { static: true }) videoElement!: ElementRef;
  @ViewChild('canvas', { static: true }) canvas!: ElementRef;

constraints = {
  video: {
      facingMode: 'environment',
      mimeType: 'video/mp4',
      width: { ideal: window.innerWidth * .98, max: 1280 },
      height: { ideal: window.innerHeight * .98, max: 720 },
      aspectRatio: { exact: 1.7777777778 },
      deviceId: ''
    }
};

capturing = false;

galleryOptions: NgxGalleryOptions[] = [];
galleryImages: NgxGalleryImage[] = [];

mediaRecorder!:MediaRecorder;

stopTimer = new Subject();
stream!:MediaStream;
timer = 0;

uploading = 0;

videoWidth = 0;
videoHeight = 0;

  constructor(
    private renderer: Renderer2,
    @Inject(MAT_DIALOG_DATA) public data: IncomingData,
    private changeDetector: ChangeDetectorRef,
    private dialogRef: MatDialogRef<MediaCaptureComponent>,
    private mediaService: MediaPasteService) {

  }

  ngOnInit(): void {



    this.galleryOptions = [
      {
          imageSwipe:true,
          imageArrowsAutoHide: false,
          thumbnailsArrowsAutoHide: false,
          arrowPrevIcon: 'fa fa-chevron-circle-left ngx-gallery-arrow',
          arrowNextIcon: 'fa fa-chevron-circle-right ngx-gallery-arrow',
          closeIcon: 'fa fa-times',
          width: '256px',
          height: '144px',
          thumbnailsColumns: 4,
          thumbnailsRows:1,
          thumbnailsSwipe:true,
          imageSize: 'contain',
          imageAnimation: NgxGalleryAnimation.Zoom,
          previewCloseOnClick: true,
          image: false,

      },
      // max-width 800
      {
          breakpoint: 1028,
          width: '100%',
          height: '600px',
          imagePercent: 100,
          thumbnailsPercent: 50,
          thumbnailsMargin: 20,
          thumbnailMargin: 20,
      },
      // max-width 400
      {
          breakpoint: 400,
          preview: true
      }

  ];

    this.startCamera();

  }

  ngOnDestroy(){


    this.stream.getTracks().forEach((track) => {
      track.stop();
    });

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

  }

  startCamera() {

    navigator.mediaDevices.enumerateDevices().then(devices => {

      const finalDevice = devices.filter(device => device.kind === 'videoinput').pop();

      this.constraints.video.deviceId = finalDevice?.deviceId || '';

      if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {

        navigator.mediaDevices
          .getUserMedia(this.constraints)
          .then(this.attachVideo.bind(this))
          .catch(this.handleError);
      } else {
      alert('Sorry, camera not available.');
      }

    }
      );


}

handleError(error:string) {
  console.log(error);
}

attachVideo(stream:MediaStream) {

  this.mediaRecorder = new MediaRecorder(stream);
  this.stream = stream;

  this.mediaRecorder.addEventListener('dataavailable', (event:BlobEvent) => {

    this.uploadAndAddToGallery(event.data, 'video');

  });

  this.renderer.setProperty(this.videoElement.nativeElement, 'srcObject', stream);
  this.renderer.listen(this.videoElement?.nativeElement, 'play', (event) => {
      this.videoHeight = this.videoElement?.nativeElement.videoHeight;
      this.videoWidth = this.videoElement?.nativeElement.videoWidth;

  });

}

toggleVideoCapture(){
  this.capturing = ! this.capturing;

  if(this.capturing){

    this.mediaRecorder.start();

    timer(0, 1000).pipe(
      takeUntil(this.stopTimer),
      take(31),
      finalize(() => this.stopCapture('timeup'))
    )
    .subscribe(t => this.timer = t * 1000);
  }
  else{
    this.stopCapture('early');
  }

}

stopCapture(state:string){

  if(state === 'early'){
    this.stopTimer.next();
  }

  if(this.mediaRecorder.state !== 'inactive'){
    this.mediaRecorder.stop();
  }

  this.capturing = false;

}

captureImage() {

    this.renderer.setProperty(this.canvas?.nativeElement, 'width', this.videoWidth);
    this.renderer.setProperty(this.canvas?.nativeElement, 'height', this.videoHeight);
    this.canvas?.nativeElement.getContext('2d').drawImage(this.videoElement?.nativeElement, 0, 0);

    this.canvas?.nativeElement.toBlob((blob:Blob) => {

      this.uploadAndAddToGallery(blob,'image');

      // this.addNewGalleryItem(URL.createObjectURL(blob), 'image');

    });
}

closeDialog(){
  this.dialogRef.close();
}

uploadAndAddToGallery(newFile:any, type:string){

  this.uploading++;

  newFile.lastModified = new Date();
  newFile.name = 'uploadFile';

  const localSrc = URL.createObjectURL(newFile);

  const uploadFile = newFile as File;

  const returnObject = this.mediaService.handleUpload(uploadFile, this.data.patientId);

  if(returnObject.mediaItem){

    returnObject.mediaItem.heightPX = this.videoHeight;
    returnObject.mediaItem.widthPX = this.videoWidth;


    setTimeout(() => {this.addNewGalleryItem(localSrc, type);},0);

    returnObject.mediaItemId
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe((result) => {

      if(returnObject.mediaItem && result){
        this.uploading--;
        this.changeDetector.detectChanges();

      }
    });
  }
}

addNewGalleryItem(itemURL:string|SafeUrl, itemType:string){

  const newGalleryItem = {
    small: itemURL,
    medium: itemURL,
    big: itemURL,
    type: itemType
  };

  const newArray = Array.from(this.galleryImages);

  newArray.unshift(newGalleryItem);

  this.galleryImages = Array.from(newArray);
  this.changeDetector.detectChanges();

}

}
