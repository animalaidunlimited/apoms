import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import {
    NgxGalleryOptions,
    NgxGalleryImage,
    NgxGalleryAnimation,
    NgxGalleryLayout
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
    constructor() {

    }

    ngOnInit() {

        this.mediaData.subscribe(mediaItems=>{
            this.mediaItem = mediaItems;
            this.mediaItem.forEach(item=>{
               this.galleryImages.push({small:item.localURL,
                                        medium:item.localURL,
                                        big:item.localURL,
                                        });
            });
        });

        this.galleryOptions = [
            {
                imageSwipe:true,
                imageArrowsAutoHide: false,
                thumbnailsArrowsAutoHide: false,
                arrowPrevIcon: 'fa fa-chevron-circle-left',
                arrowNextIcon: 'fa fa-chevron-circle-right',
                closeIcon: 'fa fa-times',
                width: '700px',
                height: '400px',
                thumbnailsColumns: 2,
                thumbnailsRows:2,
                thumbnailsSwipe:true,
                imageSize: 'contain',
                imageAnimation: NgxGalleryAnimation.Zoom,
                previewCloseOnClick: true,
                // thumbnailActions: [
                //     {
                //         icon: 'fa fa-times',
                //         onClick: this.deleteImage.bind(this),
                //         titleText: 'delete',
                //     },
                // ],
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
