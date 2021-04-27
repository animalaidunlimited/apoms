import { DatePipe } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { NgxGalleryOptions,  NgxGalleryAnimation } from '@animalaidunlimited/ngx-gallery-aau';
import { Image } from 'src/app/core/models/media';
import { BehaviorSubject } from 'rxjs';
import { MediaItem } from '../../models/media';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'thumbnail-slider',
    templateUrl: './thumbnail-slider.component.html',
    styleUrls: ['./thumbnail-slider.component.scss'],
})
export class ThumbnailSliderComponent implements OnInit{
    galleryOptions: NgxGalleryOptions[] = [];
    galleryImages: Image[] = [];
    @Input() mediaData!: BehaviorSubject<MediaItem[]>;

    @Input() patientData!: AbstractControl | null;

    constructor(public datepipe: DatePipe) {}

    ngOnInit() {

        // tslint:disable-next-line: deprecation
        this.mediaData.subscribe(mediaItems => {

            if(!mediaItems){
                this.galleryImages.push({
                    thumbnail:'../../../../../assets/images/image_placeholder.png',
                    full:'../../../../../assets/images/image_placeholder.png',
                    type: 'image',
                    comments:null
                    });

            }

            if(!mediaItems){
                return;
            }
            
            this.galleryImages = mediaItems.map(item=>{
                return {
                    thumbnail:item.remoteURL,
                    full:item.remoteURL,
                    type: item.mediaType.includes('video') ? 'video' : 'image',
                    time: this.datepipe.transform(item.datetime, 'HH:mm'),
                    date: item.datetime.toString().replace('T',' ').slice(0,10),
                    tags: item.tags,
                    comments: item.comments
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
