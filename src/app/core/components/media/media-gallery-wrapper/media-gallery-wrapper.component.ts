import { Component, OnInit, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'media-gallery-wrapper',
    templateUrl: './media-gallery-wrapper.component.html',
    styleUrls: ['./media-gallery-wrapper.component.scss'],
})
export class GalleryWrapperComponent implements OnInit{

    @Input() patientData!: AbstractControl | null;
    @Input() displayImagesAndButtons!: boolean;

    constructor() {}

    ngOnInit() {

    }

}
