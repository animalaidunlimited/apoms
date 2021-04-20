import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material-module';
import { ThumbnailSliderComponent } from '../thumbnail-slider/thumbnail-slider.component';
import { NgxGalleryModule } from '@animalaidunlimited/ngx-gallery-aau';
import { MediaGalleryModule } from '../media-gallery/media-gallery.module';

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
