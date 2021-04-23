import { Component, Input, OnInit } from '@angular/core';
import { Gallery, Image } from 'src/app/core/models/media';
@Component({
    // tslint:disable-next-line: component-selector
    selector: 'media-thumbnails',
    templateUrl: './media-thumbnails.component.html',
    styleUrls: ['./media-thumbnails.component.scss']
})
export class MediaThumbnailsComponent implements OnInit{
    @Input() gallery!:Image[];

    constructor () {}

    ngOnInit(): void {
       
    }
}