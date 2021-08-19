import { DatePipe } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';
import { MediaItem } from '../../models/media';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'thumbnail-slider',
    templateUrl: './thumbnail-slider.component.html',
    styleUrls: ['./thumbnail-slider.component.scss'],
})
export class ThumbnailSliderComponent implements OnInit{
   
    @Input() mediaData!: BehaviorSubject<MediaItem[]>;
    @Input() patientData!: AbstractControl | null;

    mediaItems:MediaItem[]=[];

    constructor(public datepipe: DatePipe) {}

    ngOnInit() {
        
    }
    
}
