import { MediaGalleryModule } from './../media/media-gallery/media-gallery.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from '../../../material-module';
import { ThumbnailSliderComponent } from '../thumbnail-slider/thumbnail-slider.component';

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
