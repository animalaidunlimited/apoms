import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MediaPasteService } from '../../services/media-paste/media-paste.service';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from '@kolkov/ngx-gallery';

interface IncomingData {
  tagNumber: string;
  patientId: number;
}

@Component({
  selector: 'app-media-capture',
  templateUrl: './media-capture.component.html',
  styleUrls: ['./media-capture.component.scss']
})
export class MediaCaptureComponent implements OnInit {

  @ViewChild('video', { static: true }) videoElement!: ElementRef;
  @ViewChild('canvas', { static: true }) canvas!: ElementRef;

constraints = {
  video: {
      facingMode: 'environment',
      mimeType: 'video/mp4',
      width: { ideal: window.innerWidth * .98, max: 1280 },
      height: { ideal: window.innerHeight * .98, max: 720 }
    }
};

capturing = false;

galleryOptions: NgxGalleryOptions[] = [];
galleryImages: NgxGalleryImage[] = [];

mediaRecorder!:MediaRecorder;

videoWidth = 0;
videoHeight = 0;

  constructor(
    private renderer: Renderer2,
    @Inject(MAT_DIALOG_DATA) public data: IncomingData,
    private changeDetector: ChangeDetectorRef,
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

  startCamera() {
    if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {

                navigator.mediaDevices
                  .getUserMedia(this.constraints)
                  .then(this.attachVideo.bind(this))
                  .catch(this.handleError);
    } else {
        alert('Sorry, camera not available.');
    }
}

handleError(error:string) {
  console.log('Error: ', error);
}

attachVideo(stream:MediaStream) {

  this.mediaRecorder = new MediaRecorder(stream);

  this.mediaRecorder.addEventListener('dataavailable', (event:BlobEvent) => {

    const newFile:any = event.data;

    newFile.lastModified = new Date();
    newFile.name = 'uploadFile';

    const uploadFile = newFile as File;

    console.log(uploadFile);

    const returnObject = this.mediaService.handleUpload(uploadFile, this.data.patientId);

    console.log(returnObject);

    if(returnObject.mediaItem){

      returnObject.mediaItem.heightPX = this.videoHeight;
      returnObject.mediaItem.widthPX = this.videoWidth;

      this.addNewGalleryItem(returnObject.mediaItem.remoteURL,'video');
    }



  });

  this.renderer.setProperty(this.videoElement.nativeElement, 'srcObject', stream);
  this.renderer.listen(this.videoElement.nativeElement, 'play', (event) => {
      this.videoHeight = this.videoElement.nativeElement.videoHeight;
      this.videoWidth = this.videoElement.nativeElement.videoWidth;
  });



}

toggleVideoCapture(){
  this.capturing = ! this.capturing;

  if(this.capturing){

    this.mediaRecorder.start();
  }
  else{

    this.mediaRecorder.stop();
  }

}

captureImage() {

    this.renderer.setProperty(this.canvas.nativeElement, 'width', this.videoWidth);
    this.renderer.setProperty(this.canvas.nativeElement, 'height', this.videoHeight);
    this.canvas.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement, 0, 0);

    this.canvas.nativeElement.toBlob((blob:Blob) => {

      this.addNewGalleryItem(URL.createObjectURL(blob), 'image');

    });
}

addNewGalleryItem(itemURL:string, itemType:string){

  const newGalleryImage = {
    small: itemURL,
    medium: itemURL,
    big: itemURL,
    type: itemType,
    url: 'video.mp4'
  };

  const newArray = this.galleryImages.map(item => item);

  newArray.unshift(newGalleryImage);

  this.galleryImages = newArray;
  this.changeDetector.detectChanges();

}

}
