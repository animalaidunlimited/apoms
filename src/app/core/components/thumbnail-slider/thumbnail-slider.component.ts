import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import {
    NgxGalleryOptions,
    NgxGalleryImage,
    NgxGalleryAnimation,
} from '@kolkov/ngx-gallery';
import { Observable } from 'rxjs';
import { MediaItem } from '../../models/media';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'thumbnail-slider',
    templateUrl: './thumbnail-slider.component.html',
    styleUrls: ['./thumbnail-slider.component.scss'],
})
export class ThumbnailSliderComponent implements OnInit{

    galleryOptions: NgxGalleryOptions[];

    galleryImages: NgxGalleryImage[] = [];

    mediaItem: MediaItem[];

    @Input() mediaData: Observable<MediaItem[]>;

    constructor() {}

    ngOnInit() {

                this.mediaData.subscribe(mediaItems=>{
                this.mediaItem = mediaItems;
                this.galleryImages = this.mediaItem.map(item=>
                                            {return{small:item.remoteURL,
                                            medium:item.remoteURL,
                                            big:item.remoteURL,
                                            };});
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
                thumbnailsColumns: 2,
                thumbnailsRows:2,
                thumbnailsSwipe:true,
                imageSize: 'contain',
                imageAnimation: NgxGalleryAnimation.Zoom,
                previewCloseOnClick: true,
                image: false,
            
            },
            // max-width 800
            {
                breakpoint: 800,
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
                preview: true,

            },
           
        ];

    }

    deleteImage(event, index): void {

        this.galleryImages.splice(index, 1);

    }
}
