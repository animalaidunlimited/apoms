import { Component, OnInit, Input } from '@angular/core';

import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from '@animalaidunlimited/ngx-gallery-aau';

import { Observable, BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { MediaItem } from '../../models/media';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'thumbnail-slider',
    templateUrl: './thumbnail-slider.component.html',
    styleUrls: ['./thumbnail-slider.component.scss'],
})
export class ThumbnailSliderComponent implements OnInit{
    galleryOptions: NgxGalleryOptions[] = [];
    galleryImages: NgxGalleryImage[] = [];
    @Input() mediaData!: BehaviorSubject<MediaItem[]>;

    constructor() {}

    ngOnInit() {

        // tslint:disable-next-line: deprecation
        this.mediaData.subscribe(mediaItems => {

            if(!mediaItems){
                this.galleryImages.push({small:'../../../../../assets/images/image_placeholder.png',
                    medium:'../../../../../assets/images/image_placeholder.png',
                    big:'../../../../../assets/images/image_placeholder.png',
                    type: 'image'
                    });

            }

            if(!mediaItems){
                return;
            }

            this.galleryImages = mediaItems.map(item=>{
               return {
                        small:item.remoteURL,
                        medium:item.remoteURL,
                        big:item.remoteURL,
                        type: item.mediaType.includes('video') ? 'video' : 'image',
                        description: item.datetime.toString().replace('T',' '),
                      };
            });



         });


        this.galleryOptions = [
            {
                imageSwipe:true,
                imageArrowsAutoHide: false,
                thumbnailsArrowsAutoHide: false,
                arrowPrevIcon: 'fa fa-chevron-circle-left ngx-gallery-arrow',
                arrowNextIcon: 'fa fa-chevron-circle-right ngx-gallery-arrow',
                closeIcon: 'fa fa-times',
                width: '550px',
                height: '300px',
                thumbnailsColumns: 3,
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

    }

    deleteImage(event:any, index:any): void {

        this.galleryImages.splice(index, 1);

    }
}
