import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from '@kolkov/ngx-gallery';
import { MediaItem } from '../../models/media';

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
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
};

capturing = false;

galleryOptions: NgxGalleryOptions[] = [];
galleryImages: NgxGalleryImage[] = [];

videoWidth = 0;
videoHeight = 0;

mediaData:MediaItem[] = [];

  constructor(private renderer: Renderer2) { }

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
 navigator.mediaDevices.getUserMedia(this.constraints).then(this.attachVideo.bind(this)).catch(this.handleError);
    } else {
        alert('Sorry, camera not available.');
    }
}

handleError(error:string) {
  console.log('Error: ', error);
}

attachVideo(stream:any) {
  this.renderer.setProperty(this.videoElement.nativeElement, 'srcObject', stream);
  this.renderer.listen(this.videoElement.nativeElement, 'play', (event) => {
      this.videoHeight = this.videoElement.nativeElement.videoHeight;
      this.videoWidth = this.videoElement.nativeElement.videoWidth;
  });

}

toggleVideoCapture(){
  this.capturing = ! this.capturing;
}

captureImage() {
  // this.renderer.setProperty(this.canvas.nativeElement, 'width', this.videoWidth);
  // this.renderer.setProperty(this.canvas.nativeElement, 'height', this.videoHeight);
  // this.canvas.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement, 0, 0);
}

}
