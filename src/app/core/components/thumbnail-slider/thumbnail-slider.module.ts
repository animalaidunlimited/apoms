import { MediaGalleryModule } from './../media/media-gallery/media-gallery.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxGalleryModule } from '@animalaidunlimited/ngx-gallery-aau';
import { MaterialModule } from '../../../material-module';
import { ThumbnailSliderComponent } from '../thumbnail-slider/thumbnail-slider.component';

@NgModule({
    declarations: [ThumbnailSliderComponent],
    imports: [
        CommonModule,
        MaterialModule,
        NgxGalleryModule,
        MediaGalleryModule
    ],
    exports: [ThumbnailSliderComponent],
})
export class ThumbnailSliderModule {}
