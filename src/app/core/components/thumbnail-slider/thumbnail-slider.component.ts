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
                    patientMediaItemId: item.patientMediaItemId,
                    width: item.widthPX,
                    height: item.heightPX
                };
            });
         });
    }

    deleteImage(event:any, index:number): void {
        this.galleryImages.splice(index, 1);

    }
}
