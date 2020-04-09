import { Component, OnInit } from '@angular/core';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from '@kolkov/ngx-gallery';


@Component({
  selector: 'thumbnail-slider',
  templateUrl: './thumbnail-slider.component.html',
  styleUrls: ['./thumbnail-slider.component.scss']
})
export class ThumbnailSliderComponent implements OnInit {
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  constructor() { }

  ngOnInit() {
    this.galleryOptions = [

      {
        imageArrowsAutoHide: true,
        thumbnailsArrowsAutoHide: true,
        arrowPrevIcon: "fa fa-chevron-left",
        arrowNextIcon: "fa fa-chevron-right",
        closeIcon: "fa fa-times",
        width: '100%',
        height: '125px',
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        previewCloseOnClick: true,
        thumbnailActions: [{icon: 'fa fa-times', onClick: this.deleteImage.bind(this), titleText: 'delete'}],
        image: false

      },
     // max-width 800

      {
          breakpoint: 800,
          width: '100%',
          height: '600px',
          imagePercent: 100,
          thumbnailsPercent: 20,
          thumbnailsMargin: 20,
          thumbnailMargin: 20,
      },
      // max-width 400
      {
          breakpoint: 400,
          preview: false,
      }
  ];

    this.galleryImages = [
      {

        small: "../../../../../assets/images/image_placeholder.png",
        medium: "../../../../../assets/images/image_placeholder.png",
        big: "../../../../../assets/images/image_placeholder.png"
      },
      // {
      //   small: 'https://preview.ibb.co/kPE1D6/clouds.jpg',
      //   medium: 'https://preview.ibb.co/kPE1D6/clouds.jpg',
      //   big: 'https://preview.ibb.co/kPE1D6/clouds.jpg'
      // },
      // {
      //   small: 'https://preview.ibb.co/mwsA6R/img7.jpg',
      //   medium: 'https://preview.ibb.co/mwsA6R/img7.jpg',
      //   big: 'https://preview.ibb.co/mwsA6R/img7.jpg'
      // },{
      //   small: 'https://preview.ibb.co/kZGsLm/img8.jpg',
      //   medium: 'https://preview.ibb.co/kZGsLm/img8.jpg',
      //   big: 'https://preview.ibb.co/kZGsLm/img8.jpg'
      // },{
      //   small: 'https://drive.google.com/uc?id=0B1iFzEx71zBabGR5VXA5cXZ1UGFqQXlfWGJwaHktMlphX2p3',
      //   medium: 'https://drive.google.com/uc?id=0B1iFzEx71zBabGR5VXA5cXZ1UGFqQXlfWGJwaHktMlphX2p3',
      //   big: 'https://drive.google.com/uc?id=0B1iFzEx71zBabGR5VXA5cXZ1UGFqQXlfWGJwaHktMlphX2p3'
      // },
    ];
  }

  deleteImage(event, index): void {
    this.galleryImages.splice(index, 1);
  }

}


