
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from 'src/app/material-module';
import { MediaGalleryModule } from '../media-gallery/media-gallery.module';
import { ThumbnailSliderComponent } from './thumbnail-slider.component';

@NgModule({
    declarations: [ThumbnailSliderComponent],
    imports: [
        CommonModule,
        MaterialModule,
        MediaGalleryModule
    ],
    exports: [ThumbnailSliderComponent],
})
export class ThumbnailSliderModule {}
